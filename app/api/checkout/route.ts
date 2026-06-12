import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const PRICE_IDS: Record<string, string> = {
  starter: 'price_1ThDmC16k4MvHMFzoQ4htL9t',
  creator: 'price_1ThDmC16k4MvHMFzVpuJXdQl',
  pro: 'price_1ThDmD16k4MvHMFzivKhrStb',
};

export async function POST(req: NextRequest) {
  const { plan, userId, email } = await req.json();

  const priceId = PRICE_IDS[plan];
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: { trial_period_days: 3 },
    customer_email: email || undefined,
    metadata: { userId: userId || '', plan },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://creatorgrowthstudio.app'}/?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://creatorgrowthstudio.app'}/onboarding`,
  });

  return NextResponse.json({ url: session.url });
}
