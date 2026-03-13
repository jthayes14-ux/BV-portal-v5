'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/useAuth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

const navy = '#1B2B5A';
const colors = {
  navy,
  navyLight: '#2A3F7A',
  text: '#1a1a1a',
  textLight: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  bg: '#F9FAFB',
  white: '#ffffff',
  success: '#22c55e',
  green: '#10B981',
  greenLight: '#ECFDF5',
  greenBorder: '#A7F3D0',
  periwinkle: '#EEF0FB',
  periwinkleText: '#4B5EA8',
  error: '#DC2626',
  errorBg: '#FEE2E2',
};

const font = "system-ui, 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
    </div>
  );
}

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function CheckoutForm({ booking, user, signUp }) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [step, setStep] = useState('payment');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [discountError, setDiscountError] = useState('');
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);

  // Account creation state
  const [savedBookingId, setSavedBookingId] = useState(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountError, setAccountError] = useState('');
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);

  const addOnsTotal = booking.add_ons_total || 0;
  const baseSubtotal = booking.subtotal || booking.total || 0;
  const frequencyDiscountAmount = Number(booking.frequency_discount) || 0;
  const afterFreqDiscount = Math.max(0, baseSubtotal - frequencyDiscountAmount);

  const codeDiscountAmount = appliedDiscount
    ? appliedDiscount.type === 'percent'
      ? Math.round(afterFreqDiscount * appliedDiscount.value / 100 * 100) / 100
      : Math.min(appliedDiscount.value, afterFreqDiscount)
    : 0;
  const total = Math.max(0, afterFreqDiscount - codeDiscountAmount);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError('');
    setAppliedDiscount(null);

    const { data, error: fetchError } = await supabase
      .from('discount_codes')
      .select('*')
      .ilike('code', discountCode.trim())
      .eq('active', true)
      .single();

    if (fetchError || !data) {
      setDiscountError('Invalid or expired discount code');
      setApplyingDiscount(false);
      return;
    }

    if (data.uses_remaining !== null && data.uses_remaining <= 0) {
      setDiscountError('This discount code has been fully redeemed');
      setApplyingDiscount(false);
      return;
    }

    setAppliedDiscount({
      id: data.id,
      code: data.code,
      type: data.type,
      value: Number(data.value),
    });
    setApplyingDiscount(false);
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode('');
    setDiscountError('');
  };

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setProcessing(true);
    setError('');

    try {
      // 1. Create Stripe customer + SetupIntent via our API
      const setupRes = await fetch('/api/create-setup-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: booking.guest_email,
          name: `${booking.guest_first_name} ${booking.guest_last_name}`,
        }),
      });

      const setupData = await setupRes.json();
      if (!setupRes.ok) {
        setError(setupData.error || 'Failed to initialize payment');
        setProcessing(false);
        return;
      }

      // 2. Confirm the SetupIntent with the card element (saves card without charging)
      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        setupData.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${booking.guest_first_name} ${booking.guest_last_name}`,
              email: booking.guest_email,
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // 3. Save booking with Stripe info
      const recurringGroupId = (booking.frequency_interval_days > 0)
        ? crypto.randomUUID()
        : null;

      const bookingRecord = {
        user_id: user?.id || null,
        customer_name: `${booking.guest_first_name} ${booking.guest_last_name}`,
        customer_email: booking.guest_email,
        neighborhood: booking.neighborhood_name,
        building: booking.building_name,
        building_id: booking.building_id,
        floor_plan: booking.floor_plan_name,
        floor_plan_id: booking.floor_plan_id,
        unit_number: booking.unit,
        booking_date: booking.date,
        booking_time: booking.time_slot,
        frequency_id: booking.frequency_id || null,
        frequency_discount: frequencyDiscountAmount,
        recurring_group_id: recurringGroupId,
        base_price: booking.base_price,
        add_ons: booking.selected_add_ons,
        add_ons_total: booking.add_ons_total,
        total_price: total,
        status: 'upcoming',
        guest_first_name: booking.guest_first_name,
        guest_last_name: booking.guest_last_name,
        guest_email: booking.guest_email,
        guest_phone: booking.guest_phone,
        special_instructions: booking.special_instructions || null,
        worker_id: booking.assigned_worker_id || null,
        stripe_customer_id: setupData.customerId,
        stripe_payment_method_id: setupIntent.payment_method,
        payment_status: 'pending',
      };

      if (appliedDiscount) {
        bookingRecord.discount_code = appliedDiscount.code;
        bookingRecord.discount_amount = codeDiscountAmount;
      }

      const { data: insertedBooking, error: insertError } = await supabase
        .from('bookings')
        .insert(bookingRecord)
        .select('id')
        .single();

      if (!insertError && appliedDiscount) {
        await supabase.rpc('decrement_discount_uses', { code_id: appliedDiscount.id });
      }

      if (insertError) {
        setError('Failed to save booking: ' + insertError.message);
        setProcessing(false);
        return;
      }

      // Auto-generate next 4 recurring bookings if interval_days > 0
      if (booking.frequency_interval_days > 0 && recurringGroupId) {
        const futureBookings = [];
        const startDate = parseLocalDate(booking.date);

        for (let i = 1; i <= 4; i++) {
          const nextDate = new Date(startDate);
          nextDate.setDate(nextDate.getDate() + (booking.frequency_interval_days * i));
          const y = nextDate.getFullYear();
          const m = String(nextDate.getMonth() + 1).padStart(2, '0');
          const d = String(nextDate.getDate()).padStart(2, '0');

          futureBookings.push({
            ...bookingRecord,
            booking_date: `${y}-${m}-${d}`,
            status: 'scheduled',
          });
        }

        if (futureBookings.length > 0) {
          await supabase.from('bookings').insert(futureBookings);
        }
      }

      // If guest booking (no logged-in user), check if a user account exists with this email
      if (!user) {
        const { data: existingUserId } = await supabase.rpc('find_user_id_by_email', {
          lookup_email: booking.guest_email,
        });
        if (existingUserId) {
          await supabase.rpc('link_guest_bookings', {
            user_uuid: existingUserId,
            user_email: booking.guest_email,
          });
        }
      }

      // Auto-populate profile data from booking for logged-in users
      if (user?.id) {
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        const profileUpdates = {};

        if (!existingProfile?.first_name && booking.guest_first_name) {
          profileUpdates.first_name = booking.guest_first_name;
        }
        if (!existingProfile?.last_name && booking.guest_last_name) {
          profileUpdates.last_name = booking.guest_last_name;
        }
        if (!existingProfile?.phone && booking.guest_phone) {
          profileUpdates.phone = booking.guest_phone;
        }

        if (!existingProfile?.address && booking.building_address) {
          profileUpdates.address = booking.unit
            ? `${booking.building_address}, Unit ${booking.unit}`
            : booking.building_address;
        }

        if (Object.keys(profileUpdates).length > 0) {
          profileUpdates.updated_at = new Date().toISOString();

          if (existingProfile) {
            await supabase.from('user_profiles')
              .update(profileUpdates)
              .eq('user_id', user.id);
          } else {
            await supabase.from('user_profiles')
              .insert({ user_id: user.id, ...profileUpdates });
          }
        }
      }

      setSavedBookingId(insertedBooking?.id || null);
      localStorage.removeItem('pendingBooking');
      setProcessing(false);
      setStep('confirmation');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setProcessing(false);
    }
  };

  const handleCreateAccount = async () => {
    setAccountError('');

    if (password.length < 6) {
      setAccountError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setAccountError('Passwords do not match');
      return;
    }

    setCreatingAccount(true);

    const { data: signUpData, error: signUpError } = await signUp(
      booking.guest_email,
      password,
      `${booking.guest_first_name} ${booking.guest_last_name}`
    );

    if (signUpError) {
      setAccountError(signUpError.message);
      setCreatingAccount(false);
      return;
    }

    const newUserId = signUpData?.user?.id;

    if (newUserId) {
      const profileData = {
        user_id: newUserId,
        first_name: booking.guest_first_name,
        last_name: booking.guest_last_name,
        phone: booking.guest_phone,
      };

      if (booking.building_address) {
        profileData.address = booking.unit
          ? `${booking.building_address}, Unit ${booking.unit}`
          : booking.building_address;
      }

      await supabase.from('user_profiles').insert(profileData);

      // Link ALL guest bookings with this email to the new account
      await supabase.rpc('link_guest_bookings', {
        user_uuid: newUserId,
        user_email: booking.guest_email,
      });
    }

    setCreatingAccount(false);
    setAccountCreated(true);
  };

  const isFormValid = cardComplete;

  const formatDate = (dateStr) => {
    return parseLocalDate(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const hasFrequencyDiscount = frequencyDiscountAmount > 0;

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: colors.text,
        fontFamily: font,
        '::placeholder': { color: colors.textMuted },
      },
      invalid: { color: colors.error },
    },
  };

  // Shared card style
  const cardStyle = {
    background: colors.white,
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
    padding: 28,
  };

  const summaryCardStyle = {
    background: colors.bg,
    borderRadius: 12,
    padding: 28,
    position: 'sticky',
    top: 24,
  };

  // --- Booking Summary Component (reused in mobile + desktop) ---
  const BookingSummary = () => (
    <div style={summaryCardStyle}>
      <h2 style={{ fontSize: 18, fontWeight: 400, color: navy, marginBottom: 24, fontFamily: font }}>Booking Summary</h2>

      {/* Building / Unit */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 16, fontWeight: 600, color: navy, marginBottom: 4, fontFamily: font }}>{booking.building_name}</p>
        <p style={{ fontSize: 14, color: colors.textLight, fontFamily: font }}>Unit {booking.unit} &middot; {booking.floor_plan_name}</p>
      </div>

      {/* Date / Time highlight box */}
      <div style={{ background: colors.periwinkle, borderRadius: 8, padding: 14, marginBottom: 20 }}>
        <p style={{ fontSize: 15, fontWeight: 500, color: colors.periwinkleText, marginBottom: 2, fontFamily: font }}>{formatDate(booking.date)}</p>
        <p style={{ fontSize: 14, color: colors.periwinkleText, fontFamily: font }}>{booking.time_slot}</p>
        {booking.frequency_name && booking.frequency_name !== 'One-Time' && (
          <p style={{ fontSize: 13, color: colors.green, fontWeight: 600, marginTop: 6, fontFamily: font }}>
            {booking.frequency_name}
            {booking.frequency_discount_percent > 0 && ` (${booking.frequency_discount_percent}% off)`}
          </p>
        )}
        {booking.frequency_interval_days > 0 && (
          <p style={{ fontSize: 12, color: colors.periwinkleText, marginTop: 2, fontFamily: font }}>
            + 4 future bookings every {booking.frequency_interval_days} days
          </p>
        )}
      </div>

      {/* Customer info */}
      <div style={{ marginBottom: 20, paddingBottom: 20, borderBottom: `1px solid ${colors.border}` }}>
        <p style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, fontFamily: font }}>Customer</p>
        <p style={{ fontSize: 14, fontWeight: 500, color: navy, marginBottom: 2, fontFamily: font }}>{booking.guest_first_name} {booking.guest_last_name}</p>
        <p style={{ fontSize: 13, color: colors.textLight, fontFamily: font }}>{booking.guest_email}</p>
        <p style={{ fontSize: 13, color: colors.textLight, fontFamily: font }}>{booking.guest_phone}</p>
      </div>

      {/* Price breakdown */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, fontFamily: font }}>
          <span style={{ color: colors.textLight }}>Window cleaning</span>
          <span style={{ color: navy, fontWeight: 500 }}>${booking.base_price}</span>
        </div>
        {booking.selected_add_ons?.map((addon, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, fontFamily: font }}>
            <span style={{ color: colors.textLight }}>{addon.name}</span>
            <span style={{ color: navy, fontWeight: 500 }}>${addon.price}</span>
          </div>
        ))}

        {/* Frequency Discount */}
        {hasFrequencyDiscount && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14, fontFamily: font }}>
            <span style={{ color: colors.green }}>{booking.frequency_name} discount ({booking.frequency_discount_percent}%)</span>
            <span style={{ color: colors.green, fontWeight: 600 }}>-${frequencyDiscountAmount.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Discount Code */}
      <div style={{ paddingTop: 16, marginBottom: 16, borderTop: `1px solid ${colors.border}` }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: navy, marginBottom: 8, fontFamily: font }}>Discount Code</label>
        {appliedDiscount ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: colors.greenLight, border: `1px solid ${colors.greenBorder}`, borderRadius: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: colors.green, fontFamily: font }}>{appliedDiscount.code}</span>
              <span style={{ fontSize: 12, color: colors.green, fontFamily: font }}>
                ({appliedDiscount.type === 'percent' ? `${appliedDiscount.value}% off` : `$${appliedDiscount.value} off`})
              </span>
            </div>
            <button onClick={handleRemoveDiscount} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: colors.error, fontWeight: 500, padding: '2px 6px', fontFamily: font }}>
              Remove
            </button>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountError(''); }}
                placeholder="Enter code"
                style={{
                  flex: 1, padding: '10px 12px', fontSize: 14,
                  border: `1px solid ${discountError ? '#FCA5A5' : colors.border}`,
                  borderRadius: 8, background: colors.white, boxSizing: 'border-box',
                  fontFamily: font,
                }}
              />
              <button
                onClick={handleApplyDiscount}
                disabled={!discountCode.trim() || applyingDiscount}
                style={{
                  padding: '10px 16px', fontSize: 13, fontWeight: 600,
                  background: discountCode.trim() && !applyingDiscount ? colors.border : '#F3F4F6',
                  color: discountCode.trim() && !applyingDiscount ? colors.text : colors.textMuted,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  cursor: discountCode.trim() && !applyingDiscount ? 'pointer' : 'not-allowed',
                  whiteSpace: 'nowrap',
                  fontFamily: font,
                }}
              >
                {applyingDiscount ? '...' : 'Apply'}
              </button>
            </div>
            {discountError && (
              <p style={{ fontSize: 12, color: colors.error, marginTop: 6, fontFamily: font }}>{discountError}</p>
            )}
          </div>
        )}
      </div>

      {appliedDiscount && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14, fontFamily: font }}>
          <span style={{ color: colors.green }}>Discount code</span>
          <span style={{ color: colors.green, fontWeight: 600 }}>-${codeDiscountAmount.toFixed(2)}</span>
        </div>
      )}

      {/* Total */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: `1px solid ${colors.border}` }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: navy, fontFamily: font }}>Total</span>
        <div style={{ textAlign: 'right' }}>
          {(hasFrequencyDiscount || appliedDiscount) && (
            <span style={{ fontSize: 14, color: colors.textMuted, textDecoration: 'line-through', marginRight: 8, fontFamily: font }}>${baseSubtotal}</span>
          )}
          <span style={{ fontSize: 24, fontWeight: 700, color: navy, fontFamily: font }}>${total.toFixed(2)}</span>
        </div>
      </div>

      <p style={{ fontSize: 12, color: colors.textLight, marginTop: 16, padding: 12, background: colors.white, borderRadius: 8, fontFamily: font }}>
        Your card will be saved and charged <strong>${total.toFixed(2)}</strong> after your cleaning is complete. Free cancellation up to 24 hours before.
      </p>
    </div>
  );

  return (
    <>
      {step === 'payment' && (
        <main className="checkout-grid" style={{ maxWidth: 960, margin: '0 auto', padding: '48px 32px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, fontFamily: font }}>
          {/* Mobile: Summary first (hidden on desktop via CSS) */}
          <div className="checkout-summary-mobile" style={{ display: 'none' }}>
            <BookingSummary />
          </div>

          {/* Payment form (left column) */}
          <div>
            <div style={cardStyle}>
              <h1 style={{ fontSize: 22, fontWeight: 400, color: navy, marginBottom: 6, fontFamily: font }}>Payment Details</h1>
              <p style={{ color: colors.textMuted, fontSize: 14, marginBottom: 28, fontFamily: font }}>Your card will be charged after the cleaning is complete</p>

              {error && (
                <div style={{ padding: '12px 16px', background: colors.errorBg, borderRadius: 8, marginBottom: 20, fontSize: 14, color: colors.error, fontFamily: font }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: navy, marginBottom: 8, fontFamily: font }}>Card details</label>
                <div style={{
                  padding: '16px',
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  background: colors.white,
                  transition: 'border-color 0.2s',
                }}>
                  <CardElement
                    options={cardElementOptions}
                    onChange={(e) => setCardComplete(e.complete)}
                  />
                </div>
              </div>

              <button onClick={handleSubmit} disabled={!isFormValid || processing || !stripe} style={{
                width: '100%', marginTop: 28, height: 48, fontSize: 16, fontWeight: 600,
                background: isFormValid && !processing ? navy : colors.border,
                border: 'none', borderRadius: 8,
                color: isFormValid && !processing ? colors.white : colors.textMuted,
                cursor: isFormValid && !processing ? 'pointer' : 'not-allowed',
                fontFamily: font,
                transition: 'background 0.2s',
              }}>
                {processing ? 'Saving payment method...' : 'Confirm Booking'}
              </button>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={colors.textMuted} strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                <span style={{ fontSize: 13, color: colors.textMuted, fontFamily: font }}>Secured by Stripe. Your card info is encrypted.</span>
              </div>
            </div>
          </div>

          {/* Booking summary (right column, hidden on mobile via CSS) */}
          <div className="checkout-summary-desktop">
            <BookingSummary />
          </div>
        </main>
      )}

      {step === 'confirmation' && (
        <main style={{ maxWidth: 500, margin: '0 auto', padding: '80px 24px', textAlign: 'center', fontFamily: font }}>
          <div style={{ width: 80, height: 80, background: colors.success, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: navy, marginBottom: 8, fontFamily: font }}>Booking Confirmed!</h1>
          <p style={{ color: colors.textLight, marginBottom: 32, fontFamily: font }}>A confirmation has been sent to {booking.guest_email}</p>

          <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: font }}>Property</p>
              <p style={{ fontWeight: 600, color: navy, fontFamily: font }}>{booking.building_name}</p>
              <p style={{ fontSize: 14, color: colors.textLight, fontFamily: font }}>Unit {booking.unit}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: font }}>Date & Time</p>
              <p style={{ fontWeight: 600, color: navy, fontFamily: font }}>{formatDate(booking.date)}</p>
              <p style={{ fontSize: 14, color: colors.textLight, fontFamily: font }}>{booking.time_slot}</p>
              {booking.frequency_name && booking.frequency_name !== 'One-Time' && (
                <p style={{ fontSize: 13, color: colors.green, fontWeight: 600, marginTop: 4, fontFamily: font }}>
                  {booking.frequency_name} frequency
                </p>
              )}
            </div>
            {booking.frequency_interval_days > 0 && (
              <div style={{ marginBottom: 20, padding: 12, background: colors.periwinkle, borderRadius: 8 }}>
                <p style={{ fontSize: 13, color: colors.periwinkleText, fontWeight: 600, marginBottom: 4, fontFamily: font }}>Recurring Service</p>
                <p style={{ fontSize: 13, color: colors.periwinkleText, fontFamily: font }}>
                  4 additional bookings have been scheduled every {booking.frequency_interval_days} days.
                </p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: font }}>Total</p>
              {hasFrequencyDiscount && (
                <p style={{ fontSize: 14, color: colors.green, marginBottom: 4, fontFamily: font }}>
                  {booking.frequency_name} discount ({booking.frequency_discount_percent}%): -${frequencyDiscountAmount.toFixed(2)}
                </p>
              )}
              {appliedDiscount && (
                <p style={{ fontSize: 14, color: colors.green, marginBottom: 4, fontFamily: font }}>
                  Discount ({appliedDiscount.code}): -${codeDiscountAmount.toFixed(2)}
                </p>
              )}
              <p style={{ fontSize: 24, fontWeight: 700, color: navy, fontFamily: font }}>${total.toFixed(2)}</p>
              <p style={{ fontSize: 13, color: colors.textLight, fontFamily: font }}>Charged after service</p>
            </div>
          </div>

          {/* Account Creation Prompt */}
          {!user && !accountCreated && (
            <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={navy} strokeWidth="2" style={{ marginBottom: 8 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: navy, marginBottom: 4, fontFamily: font }}>Create a password to track your bookings</h3>
                <p style={{ fontSize: 14, color: colors.textLight, fontFamily: font }}>Manage, reschedule, and view your booking history</p>
              </div>

              {accountError && (
                <div style={{ padding: '10px 14px', background: colors.errorBg, borderRadius: 8, marginBottom: 16, fontSize: 13, color: colors.error, fontFamily: font }}>
                  {accountError}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: navy, marginBottom: 6, fontFamily: font }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{ width: '100%', padding: '14px 16px', fontSize: 15, border: `1px solid ${colors.border}`, borderRadius: 8, boxSizing: 'border-box', background: colors.white, fontFamily: font }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: navy, marginBottom: 6, fontFamily: font }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  style={{ width: '100%', padding: '14px 16px', fontSize: 15, border: `1px solid ${colors.border}`, borderRadius: 8, boxSizing: 'border-box', background: colors.white, fontFamily: font }}
                />
              </div>

              <button
                onClick={handleCreateAccount}
                disabled={creatingAccount || !password || !confirmPassword}
                style={{
                  width: '100%', height: 48, fontSize: 15, fontWeight: 600,
                  background: !creatingAccount && password && confirmPassword ? navy : colors.border,
                  color: !creatingAccount && password && confirmPassword ? colors.white : colors.textMuted,
                  border: 'none', borderRadius: 8,
                  cursor: !creatingAccount && password && confirmPassword ? 'pointer' : 'not-allowed',
                  marginBottom: 12,
                  fontFamily: font,
                }}
              >
                {creatingAccount ? 'Creating Account...' : 'Create Account'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setStep('done')}
                  style={{ background: 'none', border: 'none', color: colors.textLight, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', padding: '8px 16px', fontFamily: font }}
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Account Created Success */}
          {accountCreated && (
            <div style={{ background: colors.greenLight, borderRadius: 12, border: `1px solid ${colors.greenBorder}`, padding: 20, textAlign: 'center', marginBottom: 32 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={colors.green} strokeWidth="2" style={{ marginBottom: 8 }}>
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 600, color: colors.green, fontFamily: font }}>Account created successfully!</p>
              <p style={{ fontSize: 13, color: colors.green, marginTop: 4, fontFamily: font }}>You can now track and manage your bookings.</p>
            </div>
          )}

          <div className="confirmation-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(user || accountCreated) && (
              <Link href="/dashboard" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: navy, border: 'none', borderRadius: 8, color: colors.white, textDecoration: 'none', fontFamily: font }}>
                View My Bookings
              </Link>
            )}
            <Link href="/book" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 8, color: navy, textDecoration: 'none', fontFamily: font }}>
              Book Another
            </Link>
          </div>
          <p style={{ fontSize: 13, color: colors.textLight, marginTop: 32, fontFamily: font }}>Questions? Contact us at hello@betterview.com</p>
        </main>
      )}

      {step === 'done' && (
        <main style={{ maxWidth: 500, margin: '0 auto', padding: '80px 24px', textAlign: 'center', fontFamily: font }}>
          <div style={{ width: 80, height: 80, background: colors.success, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: navy, marginBottom: 8, fontFamily: font }}>You're All Set!</h1>
          <p style={{ color: colors.textLight, marginBottom: 32, fontFamily: font }}>Your booking confirmation has been sent to {booking.guest_email}</p>

          <div style={{ ...cardStyle, textAlign: 'left', marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: font }}>Property</p>
              <p style={{ fontWeight: 600, color: navy, fontFamily: font }}>{booking.building_name}</p>
              <p style={{ fontSize: 14, color: colors.textLight, fontFamily: font }}>Unit {booking.unit}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: font }}>Date & Time</p>
              <p style={{ fontWeight: 600, color: navy, fontFamily: font }}>{formatDate(booking.date)}</p>
              <p style={{ fontSize: 14, color: colors.textLight, fontFamily: font }}>{booking.time_slot}</p>
              {booking.frequency_name && booking.frequency_name !== 'One-Time' && (
                <p style={{ fontSize: 13, color: colors.green, fontWeight: 600, marginTop: 4, fontFamily: font }}>
                  {booking.frequency_name} frequency
                </p>
              )}
            </div>
            {booking.frequency_interval_days > 0 && (
              <div style={{ marginBottom: 20, padding: 12, background: colors.periwinkle, borderRadius: 8 }}>
                <p style={{ fontSize: 13, color: colors.periwinkleText, fontWeight: 600, marginBottom: 4, fontFamily: font }}>Recurring Service</p>
                <p style={{ fontSize: 13, color: colors.periwinkleText, fontFamily: font }}>
                  4 additional bookings have been scheduled every {booking.frequency_interval_days} days.
                </p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 12, fontWeight: 500, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, fontFamily: font }}>Total</p>
              {hasFrequencyDiscount && (
                <p style={{ fontSize: 14, color: colors.green, marginBottom: 4, fontFamily: font }}>
                  {booking.frequency_name} discount: -${frequencyDiscountAmount.toFixed(2)}
                </p>
              )}
              <p style={{ fontSize: 24, fontWeight: 700, color: navy, fontFamily: font }}>${total.toFixed(2)}</p>
              <p style={{ fontSize: 13, color: colors.textLight, fontFamily: font }}>Charged after service</p>
            </div>
          </div>

          <div className="confirmation-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: navy, border: 'none', borderRadius: 8, color: colors.white, textDecoration: 'none', fontFamily: font }}>
              Book Another Service
            </Link>
            <Link href="/" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: colors.white, border: `1px solid ${colors.border}`, borderRadius: 8, color: navy, textDecoration: 'none', fontFamily: font }}>
              Back to Home
            </Link>
          </div>
          <p style={{ fontSize: 13, color: colors.textLight, marginTop: 32, fontFamily: font }}>Questions? Contact us at hello@betterview.com</p>
        </main>
      )}
    </>
  );
}

export default function PaymentFlow() {
  const router = useRouter();
  const { user, signUp } = useAuth();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('pendingBooking');
    if (stored) {
      setBooking(JSON.parse(stored));
    } else {
      router.push('/book');
    }
  }, []);

  if (!booking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: colors.bg }}>
        <p style={{ color: colors.textLight, fontFamily: font }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.bg }}>
      <header className="checkout-header" style={{ padding: '16px 32px', background: colors.white, borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: font }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: navy }}>{`BetterView`}</span>
        </Link>
        <div style={{ fontSize: 14, color: colors.textMuted }}>Secure checkout</div>
      </header>

      <Elements stripe={stripePromise}>
        <CheckoutForm booking={booking} user={user} signUp={signUp} />
      </Elements>
    </div>
  );
}
