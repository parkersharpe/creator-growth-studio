import Stripe from 'stripe';
import { sql } from '@vercel/postgres';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const PLAN_PRICES: Record<string, string> = {
  starter: 'price_1ThZ8316k4MvHMFz4WGEGDRF',   // $7.99/mo
  unlimited: 'price_1ThDmC16k4MvHMFzVpuJXdQl', // $14.99/mo
};

// Legacy prices from before the two-plan structure
const LEGACY_PLAN_BY_PRICE: Record<string, string> = {
  'price_1ThDmC16k4MvHMFzoQ4htL9t': 'starter',   // old $9.99
  'price_1ThDmD16k4MvHMFzivKhrStb': 'unlimited', // old $19.99
};

export function planForPrice(priceId: string): string | null {
  for (const [plan, id] of Object.entries(PLAN_PRICES)) {
    if (id === priceId) return plan;
  }
  return LEGACY_PLAN_BY_PRICE[priceId] || null;
}

// Find the Stripe customer for a Clerk user: DB mapping first, then email, then
// checkout session history. Saves the mapping once found.
export async function findCustomerId(userId: string, email?: string | null): Promise<string | null> {
  try {
    const { rows } = await sql`SELECT value FROM user_data WHERE user_id = ${userId} AND key = 'stripe_customer'`;
    if (rows[0]?.value) return rows[0].value;
  } catch {}

  let customerId: string | null = null;

  if (email) {
    const customers = await stripe.customers.list({ email, limit: 5 });
    customerId = customers.data[0]?.id || null;
  }

  if (!customerId) {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });
    const match = sessions.data.find(s => s.client_reference_id === userId && s.customer);
    customerId = (match?.customer as string) || null;
  }

  if (customerId) await saveCustomerMapping(userId, customerId);
  return customerId;
}

export async function saveCustomerMapping(userId: string, customerId: string) {
  try {
    await sql`
      INSERT INTO user_data (user_id, key, value, updated_at)
      VALUES (${userId}, 'stripe_customer', ${customerId}, NOW())
      ON CONFLICT (user_id, key) DO UPDATE SET value = ${customerId}, updated_at = NOW()
    `;
  } catch {}
}
