import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { stripe, findCustomerId } from '@/lib/billing';

export async function POST() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const user = await currentUser();
    const email = user?.primaryEmailAddress?.emailAddress || null;
    const customerId = await findCustomerId(userId, email);
    if (!customerId) return NextResponse.json({ error: 'No subscription found' }, { status: 404 });

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.creatorgrowthstudio.app'}/brand`,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error('billing portal failed', e);
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 500 });
  }
}
