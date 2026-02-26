import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET(request) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    // Find bookings where job time was 2+ hours ago AND payment_status is "pending"
    // AND they have Stripe payment info saved
    const { data: pendingBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('payment_status', 'pending')
      .not('stripe_customer_id', 'is', null)
      .not('stripe_payment_method_id', 'is', null);

    if (fetchError) {
      console.error('Failed to fetch pending bookings:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }

    // Filter bookings where the job time has passed by 2+ hours
    const dueBookings = (pendingBookings || []).filter(booking => {
      if (!booking.booking_date || !booking.booking_time) return false;

      // Parse booking time - extract the start time from slot like "9:00 AM - 11:00 AM"
      const timeStr = booking.booking_time.split(' - ')[0]?.trim();
      if (!timeStr) return false;

      // Build a full datetime from booking_date + booking_time
      const bookingDateTime = new Date(`${booking.booking_date} ${timeStr}`);
      if (isNaN(bookingDateTime.getTime())) return false;

      return bookingDateTime <= twoHoursAgo;
    });

    const results = [];

    for (const booking of dueBookings) {
      try {
        const amountInCents = Math.round((Number(booking.total_price) || 0) * 100);

        if (amountInCents <= 0) {
          await supabase
            .from('bookings')
            .update({ payment_status: 'paid' })
            .eq('id', booking.id);
          results.push({ id: booking.id, status: 'paid', amount: 0 });
          continue;
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
            .eq('id', booking.id);
          results.push({ id: booking.id, status: 'paid', amount: amountInCents });
        } else {
          await supabase
            .from('bookings')
            .update({ payment_status: 'failed' })
            .eq('id', booking.id);
          results.push({ id: booking.id, status: 'failed' });
        }
      } catch (chargeErr) {
        console.error(`Failed to charge booking ${booking.id}:`, chargeErr);
        await supabase
          .from('bookings')
          .update({ payment_status: 'failed' })
          .eq('id', booking.id);
        results.push({ id: booking.id, status: 'failed', error: chargeErr.message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (err) {
    console.error('Process payments error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
