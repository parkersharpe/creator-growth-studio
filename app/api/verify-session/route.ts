import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Stripe from 'stripe';
import { saveCustomerMapping } from '@/lib/billing';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) return NextResponse.json({ ok: false, error: 'Missing session_id' }, { status: 400 });

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, { expand: ['subscription'] });

    // The session must belong to the signed-in user (when we know who started it)
    if (session.client_reference_id && userId && session.client_reference_id !== userId) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const sub = session.subscription as Stripe.Subscription | null;
    const subActive = !!sub && (sub.status === 'active' || sub.status === 'trialing');
    const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
    const ok = session.status === 'complete' && (subActive || paid);

    // Remember which Stripe customer belongs to this user (for plan display / billing portal)
    if (ok && userId && typeof session.customer === 'string') {
      await saveCustomerMapping(userId, session.customer);
    }

    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
