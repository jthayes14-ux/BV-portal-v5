import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { booking_id } = await request.json();

    if (!booking_id) {
      return NextResponse.json({ error: 'booking_id is required' }, { status: 400 });
    }

    // Look up the booking
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (!booking.stripe_customer_id || !booking.stripe_payment_method_id) {
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', booking_id);

      return NextResponse.json({ error: 'No payment method on file' }, { status: 400 });
    }

    if (booking.payment_status === 'paid') {
      return NextResponse.json({ error: 'Booking already paid' }, { status: 400 });
    }

    // Charge the saved card
    const amountInCents = Math.round((Number(booking.total_price) || 0) * 100);

    if (amountInCents <= 0) {
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', booking_id);

      return NextResponse.json({ success: true, payment_status: 'paid', amount: 0 });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'usd',
      customer: booking.stripe_customer_id,
      payment_method: booking.stripe_payment_method_id,
      off_session: true,
      confirm: true,
      description: `BetterView booking #${booking.id} - ${booking.building || ''} Unit ${booking.unit_number || ''}`,
    });

    if (paymentIntent.status === 'succeeded') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', booking_id);

      return NextResponse.json({ success: true, payment_status: 'paid', amount: amountInCents });
    } else {
      await supabase
        .from('bookings')
        .update({ payment_status: 'failed' })
        .eq('id', booking_id);

      return NextResponse.json({ success: false, payment_status: 'failed' }, { status: 400 });
    }
  } catch (err) {
    console.error('Charge booking error:', err);

    // If we have a booking_id, mark as failed
    try {
      const { booking_id } = await request.clone().json();
      if (booking_id) {
        await supabase
          .from('bookings')
          .update({ payment_status: 'failed' })
          .eq('id', booking_id);
      }
    } catch (_) {}

    return NextResponse.json(
      { error: err.message, payment_status: 'failed' },
      { status: 500 }
    );
  }
}
