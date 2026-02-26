'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/useAuth';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
    </div>
  );
}

function CheckoutForm({ booking, brand, user, signUp }) {
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
        const startDate = new Date(booking.date + 'T00:00:00');

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

      if (savedBookingId) {
        await supabase
          .from('bookings')
          .update({ user_id: newUserId })
          .eq('id', savedBookingId);
      }
    }

    setCreatingAccount(false);
    setAccountCreated(true);
  };

  const isFormValid = cardComplete;

  const inputStyle = {
    width: '100%', padding: '16px', fontSize: 16,
    border: `1px solid ${brand.border}`, borderRadius: 8,
    boxSizing: 'border-box', background: brand.white,
  };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: brand.text, marginBottom: 8 };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  const hasFrequencyDiscount = frequencyDiscountAmount > 0;

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1a1a1a',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        '::placeholder': { color: '#999' },
      },
      invalid: { color: '#DC2626' },
    },
  };

  return (
    <>
      {step === 'payment' && (
        <main className="checkout-grid" style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: 48 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Payment Details</h1>
            <p style={{ color: brand.textLight, marginBottom: 32 }}>Your card will be charged after the cleaning is complete</p>

            {error && (
              <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#DC2626' }}>
                {error}
              </div>
            )}

            <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, padding: 24 }}>
              <div>
                <label style={labelStyle}>Card details</label>
                <div style={{
                  padding: '16px',
                  border: `1px solid ${brand.border}`,
                  borderRadius: 8,
                  background: brand.white,
                }}>
                  <CardElement
                    options={cardElementOptions}
                    onChange={(e) => setCardComplete(e.complete)}
                  />
                </div>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={!isFormValid || processing || !stripe} style={{
              width: '100%', marginTop: 24, padding: 18, fontSize: 16, fontWeight: 600,
              background: isFormValid && !processing ? brand.text : brand.border,
              border: 'none', borderRadius: 8,
              color: isFormValid && !processing ? brand.white : '#999',
              cursor: isFormValid && !processing ? 'pointer' : 'not-allowed'
            }}>
              {processing ? 'Saving payment method...' : 'Confirm Booking'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.textLight} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span style={{ fontSize: 13, color: brand.textLight }}>Secured by Stripe. Your card info is encrypted.</span>
            </div>
          </div>

          <div>
            <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, padding: 24, position: 'sticky', top: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: brand.text, marginBottom: 20 }}>Booking Summary</h3>
              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 600, color: brand.text, marginBottom: 4 }}>{booking.building_name}</p>
                <p style={{ fontSize: 14, color: brand.textLight }}>Unit {booking.unit} · {booking.floor_plan_name}</p>
              </div>
              <div style={{ background: brand.bg, borderRadius: 8, padding: 12, marginBottom: 20 }}>
                <p style={{ fontWeight: 500, color: brand.text, marginBottom: 2 }}>{formatDate(booking.date)}</p>
                <p style={{ fontSize: 14, color: brand.textLight }}>{booking.time_slot}</p>
                {booking.frequency_name && booking.frequency_name !== 'One-Time' && (
                  <p style={{ fontSize: 13, color: '#C9B037', fontWeight: 600, marginTop: 4 }}>
                    Frequency: {booking.frequency_name}
                    {booking.frequency_discount_percent > 0 && ` (${booking.frequency_discount_percent}% off)`}
                  </p>
                )}
                {booking.frequency_interval_days > 0 && (
                  <p style={{ fontSize: 12, color: brand.textLight, marginTop: 2 }}>
                    + 4 future bookings every {booking.frequency_interval_days} days
                  </p>
                )}
              </div>

              {/* Guest info summary */}
              <div style={{ background: brand.bg, borderRadius: 8, padding: 12, marginBottom: 20 }}>
                <p style={{ fontWeight: 500, color: brand.text, marginBottom: 2 }}>{booking.guest_first_name} {booking.guest_last_name}</p>
                <p style={{ fontSize: 14, color: brand.textLight }}>{booking.guest_email}</p>
                <p style={{ fontSize: 14, color: brand.textLight }}>{booking.guest_phone}</p>
              </div>

              <div style={{ borderTop: `1px solid ${brand.border}`, paddingTop: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                  <span style={{ color: brand.textLight }}>Window cleaning</span>
                  <span style={{ color: brand.text }}>${booking.base_price}</span>
                </div>
                {booking.selected_add_ons?.map((addon, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                    <span style={{ color: brand.textLight }}>{addon.name}</span>
                    <span style={{ color: brand.text }}>${addon.price}</span>
                  </div>
                ))}

                {/* Frequency Discount */}
                {hasFrequencyDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                    <span style={{ color: '#C9B037' }}>{booking.frequency_name} discount ({booking.frequency_discount_percent}%)</span>
                    <span style={{ color: '#C9B037', fontWeight: 600 }}>-${frequencyDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                {/* Discount Code */}
                <div style={{ marginTop: 16, marginBottom: 16, paddingTop: 16, borderTop: `1px solid ${brand.border}` }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: brand.text, marginBottom: 8 }}>Discount Code</label>
                  {appliedDiscount ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>{appliedDiscount.code}</span>
                        <span style={{ fontSize: 12, color: '#15803D' }}>
                          ({appliedDiscount.type === 'percent' ? `${appliedDiscount.value}% off` : `$${appliedDiscount.value} off`})
                        </span>
                      </div>
                      <button onClick={handleRemoveDiscount} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#DC2626', fontWeight: 500, padding: '2px 6px' }}>
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
                          style={{ flex: 1, padding: '10px 12px', fontSize: 14, border: `1px solid ${discountError ? '#FCA5A5' : brand.border}`, borderRadius: 8, background: brand.white, boxSizing: 'border-box' }}
                        />
                        <button
                          onClick={handleApplyDiscount}
                          disabled={!discountCode.trim() || applyingDiscount}
                          style={{
                            padding: '10px 16px', fontSize: 13, fontWeight: 600,
                            background: discountCode.trim() && !applyingDiscount ? brand.text : brand.border,
                            color: discountCode.trim() && !applyingDiscount ? brand.white : '#999',
                            border: 'none', borderRadius: 8,
                            cursor: discountCode.trim() && !applyingDiscount ? 'pointer' : 'not-allowed',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {applyingDiscount ? '...' : 'Apply'}
                        </button>
                      </div>
                      {discountError && (
                        <p style={{ fontSize: 12, color: '#DC2626', marginTop: 6 }}>{discountError}</p>
                      )}
                    </div>
                  )}
                </div>

                {appliedDiscount && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 14 }}>
                    <span style={{ color: '#16A34A' }}>Discount code</span>
                    <span style={{ color: '#16A34A', fontWeight: 600 }}>-${codeDiscountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, marginTop: 8, borderTop: `1px solid ${brand.border}` }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>Total</span>
                  <div style={{ textAlign: 'right' }}>
                    {(hasFrequencyDiscount || appliedDiscount) && (
                      <span style={{ fontSize: 14, color: brand.textLight, textDecoration: 'line-through', marginRight: 8 }}>${baseSubtotal}</span>
                    )}
                    <span style={{ fontSize: 20, fontWeight: 700, color: brand.text }}>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: brand.textLight, marginTop: 16, padding: 12, background: brand.bg, borderRadius: 6 }}>
                Your card will be saved and charged <strong>${total.toFixed(2)}</strong> after your cleaning is complete. Free cancellation up to 24 hours before.
              </p>
            </div>
          </div>
        </main>
      )}

      {step === 'confirmation' && (
        <main style={{ maxWidth: 500, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: brand.success, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Booking Confirmed!</h1>
          <p style={{ color: brand.textLight, marginBottom: 32 }}>A confirmation has been sent to {booking.guest_email}</p>

          <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, padding: 24, textAlign: 'left', marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>PROPERTY</p>
              <p style={{ fontWeight: 600, color: brand.text }}>{booking.building_name}</p>
              <p style={{ fontSize: 14, color: brand.textLight }}>Unit {booking.unit}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>DATE & TIME</p>
              <p style={{ fontWeight: 600, color: brand.text }}>{formatDate(booking.date)}</p>
              <p style={{ fontSize: 14, color: brand.textLight }}>{booking.time_slot}</p>
              {booking.frequency_name && booking.frequency_name !== 'One-Time' && (
                <p style={{ fontSize: 13, color: '#C9B037', fontWeight: 600, marginTop: 4 }}>
                  {booking.frequency_name} frequency
                </p>
              )}
            </div>
            {booking.frequency_interval_days > 0 && (
              <div style={{ marginBottom: 20, padding: 12, background: '#FFFBEB', borderRadius: 8, border: '1px solid #FEF3C7' }}>
                <p style={{ fontSize: 13, color: '#92400E', fontWeight: 600, marginBottom: 4 }}>Recurring Service</p>
                <p style={{ fontSize: 13, color: '#78350F' }}>
                  4 additional bookings have been scheduled every {booking.frequency_interval_days} days.
                </p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>TOTAL</p>
              {hasFrequencyDiscount && (
                <p style={{ fontSize: 14, color: '#C9B037', marginBottom: 4 }}>
                  {booking.frequency_name} discount ({booking.frequency_discount_percent}%): -${frequencyDiscountAmount.toFixed(2)}
                </p>
              )}
              {appliedDiscount && (
                <p style={{ fontSize: 14, color: '#16A34A', marginBottom: 4 }}>
                  Discount ({appliedDiscount.code}): -${codeDiscountAmount.toFixed(2)}
                </p>
              )}
              <p style={{ fontSize: 24, fontWeight: 700, color: brand.text }}>${total.toFixed(2)}</p>
              <p style={{ fontSize: 13, color: brand.textLight }}>Charged after service</p>
            </div>
          </div>

          {/* Account Creation Prompt */}
          {!user && !accountCreated && (
            <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, padding: 24, textAlign: 'left', marginBottom: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={brand.gold} strokeWidth="2" style={{ marginBottom: 8 }}>
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 4 }}>Create a password to track your bookings</h3>
                <p style={{ fontSize: 14, color: brand.textLight }}>Manage, reschedule, and view your booking history</p>
              </div>

              {accountError && (
                <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#DC2626' }}>
                  {accountError}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: brand.text, marginBottom: 6 }}>Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  style={{ width: '100%', padding: '14px 16px', fontSize: 15, border: `1px solid ${brand.border}`, borderRadius: 8, boxSizing: 'border-box', background: brand.white }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: brand.text, marginBottom: 6 }}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  style={{ width: '100%', padding: '14px 16px', fontSize: 15, border: `1px solid ${brand.border}`, borderRadius: 8, boxSizing: 'border-box', background: brand.white }}
                />
              </div>

              <button
                onClick={handleCreateAccount}
                disabled={creatingAccount || !password || !confirmPassword}
                style={{
                  width: '100%', padding: '16px', fontSize: 15, fontWeight: 600,
                  background: !creatingAccount && password && confirmPassword ? brand.text : brand.border,
                  color: !creatingAccount && password && confirmPassword ? brand.white : '#999',
                  border: 'none', borderRadius: 8,
                  cursor: !creatingAccount && password && confirmPassword ? 'pointer' : 'not-allowed',
                  marginBottom: 12,
                }}
              >
                {creatingAccount ? 'Creating Account...' : 'Create Account'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => setStep('done')}
                  style={{ background: 'none', border: 'none', color: brand.textLight, fontSize: 14, cursor: 'pointer', textDecoration: 'underline', padding: '8px 16px' }}
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Account Created Success */}
          {accountCreated && (
            <div style={{ background: '#F0FDF4', borderRadius: 12, border: '1px solid #BBF7D0', padding: 20, textAlign: 'center', marginBottom: 32 }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" style={{ marginBottom: 8 }}>
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#16A34A' }}>Account created successfully!</p>
              <p style={{ fontSize: 13, color: '#15803D', marginTop: 4 }}>You can now track and manage your bookings.</p>
            </div>
          )}

          <div className="confirmation-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {(user || accountCreated) && (
              <Link href="/dashboard" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: brand.primary, border: 'none', borderRadius: 8, color: brand.text, textDecoration: 'none' }}>
                View My Bookings
              </Link>
            )}
            <Link href="/book" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: brand.white, border: `1px solid ${brand.border}`, borderRadius: 8, color: brand.text, textDecoration: 'none' }}>
              Book Another
            </Link>
          </div>
          <p style={{ fontSize: 13, color: brand.textLight, marginTop: 32 }}>Questions? Contact us at hello@betterview.com</p>
        </main>
      )}

      {step === 'done' && (
        <main style={{ maxWidth: 500, margin: '0 auto', padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, background: brand.success, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: brand.text, marginBottom: 8 }}>You're All Set!</h1>
          <p style={{ color: brand.textLight, marginBottom: 32 }}>Your booking confirmation has been sent to {booking.guest_email}</p>

          <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, padding: 24, textAlign: 'left', marginBottom: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>PROPERTY</p>
              <p style={{ fontWeight: 600, color: brand.text }}>{booking.building_name}</p>
              <p style={{ fontSize: 14, color: brand.textLight }}>Unit {booking.unit}</p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>DATE & TIME</p>
              <p style={{ fontWeight: 600, color: brand.text }}>{formatDate(booking.date)}</p>
              <p style={{ fontSize: 14, color: brand.textLight }}>{booking.time_slot}</p>
              {booking.frequency_name && booking.frequency_name !== 'One-Time' && (
                <p style={{ fontSize: 13, color: '#C9B037', fontWeight: 600, marginTop: 4 }}>
                  {booking.frequency_name} frequency
                </p>
              )}
            </div>
            {booking.frequency_interval_days > 0 && (
              <div style={{ marginBottom: 20, padding: 12, background: '#FFFBEB', borderRadius: 8, border: '1px solid #FEF3C7' }}>
                <p style={{ fontSize: 13, color: '#92400E', fontWeight: 600, marginBottom: 4 }}>Recurring Service</p>
                <p style={{ fontSize: 13, color: '#78350F' }}>
                  4 additional bookings have been scheduled every {booking.frequency_interval_days} days.
                </p>
              </div>
            )}
            <div>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>TOTAL</p>
              {hasFrequencyDiscount && (
                <p style={{ fontSize: 14, color: '#C9B037', marginBottom: 4 }}>
                  {booking.frequency_name} discount: -${frequencyDiscountAmount.toFixed(2)}
                </p>
              )}
              <p style={{ fontSize: 24, fontWeight: 700, color: brand.text }}>${total.toFixed(2)}</p>
              <p style={{ fontSize: 13, color: brand.textLight }}>Charged after service</p>
            </div>
          </div>

          <div className="confirmation-buttons" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/book" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: brand.primary, border: 'none', borderRadius: 8, color: brand.text, textDecoration: 'none' }}>
              Book Another Service
            </Link>
            <Link href="/" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: brand.white, border: `1px solid ${brand.border}`, borderRadius: 8, color: brand.text, textDecoration: 'none' }}>
              Back to Home
            </Link>
          </div>
          <p style={{ fontSize: 13, color: brand.textLight, marginTop: 32 }}>Questions? Contact us at hello@betterview.com</p>
        </main>
      )}
    </>
  );
}

export default function PaymentFlow() {
  const router = useRouter();
  const { user, signUp } = useAuth();
  const [booking, setBooking] = useState(null);

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa', white: '#ffffff', success: '#22c55e',
    gold: '#C9B037', goldDark: '#A69028',
  };

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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}>
        <p style={{ color: brand.textLight }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      <header className="checkout-header" style={{ padding: '16px 32px', background: brand.white, borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
        </Link>
        <div style={{ fontSize: 14, color: brand.textLight }}>Secure checkout</div>
      </header>

      <Elements stripe={stripePromise}>
        <CheckoutForm booking={booking} brand={brand} user={user} signUp={signUp} />
      </Elements>
    </div>
  );
}
