import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, findCustomerId, planForPrice } from '@/lib/billing';

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress || null;
    const customerId = await findCustomerId(userId, email);
    if (!customerId) return NextResponse.json({ plan: null });

    const subs = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 10 });
    const sub = subs.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status));
    if (!sub) return NextResponse.json({ plan: null });

    const priceId = sub.items.data[0]?.price.id || '';
    return NextResponse.json({
      plan: planForPrice(priceId),
      status: sub.status,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      currentPeriodEnd: sub.items.data[0]?.current_period_end ?? null,
    });
  } catch (e) {
    console.error('subscription lookup failed', e);
    return NextResponse.json({ plan: null, error: 'Lookup failed' }, { status: 500 });
  }
}
