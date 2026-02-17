'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
    </div>
  );
}

export default function PaymentFlow() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [step, setStep] = useState('payment');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState('');

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa', white: '#ffffff', success: '#22c55e',
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    const stored = localStorage.getItem('pendingBooking');
    if (stored) {
      setBooking(JSON.parse(stored));
    } else {
      router.push('/book');
    }
  }, [authLoading, user]);

  if (!booking || authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}>
        <p style={{ color: brand.textLight }}>Loading...</p>
      </div>
    );
  }

  const addOnsTotal = booking.add_ons_total || 0;
  const total = booking.total || 0;

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const parts = [];
    for (let i = 0; i < v.length && i < 16; i += 4) {
      parts.push(v.substring(i, i + 4));
    }
    return parts.join(' ');
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) return v.substring(0, 2) + ' / ' + v.substring(2, 4);
    return v;
  };

  const handleSubmit = async () => {
    setProcessing(true);
    setError('');

    const { error: insertError } = await supabase.from('bookings').insert({
      user_id: user.id,
      customer_name: user.user_metadata?.full_name || name,
      customer_email: user.email,
      neighborhood: booking.neighborhood_name,
      building: booking.building_name,
      building_id: booking.building_id,
      floor_plan: booking.floor_plan_name,
      floor_plan_id: booking.floor_plan_id,
      unit: booking.unit,
      date: booking.date,
      time_slot: booking.time_slot,
      recurrence: booking.recurrence,
      base_price: booking.base_price,
      add_ons: booking.selected_add_ons,
      add_ons_total: booking.add_ons_total,
      total: booking.total,
      status: 'upcoming',
    });

    if (insertError) {
      setError('Failed to save booking: ' + insertError.message);
      setProcessing(false);
      return;
    }

    localStorage.removeItem('pendingBooking');
    setProcessing(false);
    setStep('confirmation');
  };

  const isFormValid = cardNumber.length >= 19 && expiry.length >= 7 && cvc.length >= 3 && name.length > 0;

  const inputStyle = {
    width: '100%', padding: '16px', fontSize: 16,
    border: `1px solid ${brand.border}`, borderRadius: 8,
    boxSizing: 'border-box', background: brand.white,
  };
  const labelStyle = { display: 'block', fontSize: 14, fontWeight: 500, color: brand.text, marginBottom: 8 };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      <header style={{ padding: '16px 32px', background: brand.white, borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
        </Link>
        <div style={{ fontSize: 14, color: brand.textLight }}>Secure checkout</div>
      </header>

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
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Name on card</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Card number</label>
                <input type="text" value={cardNumber} onChange={(e) => setCardNumber(formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456" maxLength={19} style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Expiry date</label>
                  <input type="text" value={expiry} onChange={(e) => setExpiry(formatExpiry(e.target.value))} placeholder="MM / YY" maxLength={7} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CVC</label>
                  <input type="text" value={cvc} onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="123" maxLength={4} style={inputStyle} />
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', paddingTop: 16, borderTop: `1px solid ${brand.border}` }}>
                <input type="checkbox" checked={saveCard} onChange={(e) => setSaveCard(e.target.checked)} style={{ width: 18, height: 18 }} />
                <span style={{ fontSize: 14, color: brand.text }}>Save card for future bookings</span>
              </label>
            </div>

            <button onClick={handleSubmit} disabled={!isFormValid || processing} style={{
              width: '100%', marginTop: 24, padding: 18, fontSize: 16, fontWeight: 600,
              background: isFormValid && !processing ? brand.text : brand.border,
              border: 'none', borderRadius: 8,
              color: isFormValid && !processing ? brand.white : '#999',
              cursor: isFormValid && !processing ? 'pointer' : 'not-allowed'
            }}>
              {processing ? 'Processing...' : 'Confirm Booking'}
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
                {booking.recurrence !== 'one-time' && (
                  <p style={{ fontSize: 13, color: '#C9B037', fontWeight: 600, marginTop: 4 }}>
                    Recurring: {booking.recurrence}
                  </p>
                )}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, marginTop: 8, borderTop: `1px solid ${brand.border}` }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: brand.text }}>${total}</span>
                </div>
              </div>
              <p style={{ fontSize: 12, color: brand.textLight, marginTop: 16, padding: 12, background: brand.bg, borderRadius: 6 }}>
                Your card will be saved and charged <strong>${total}</strong> after your cleaning is complete. Free cancellation up to 24 hours before.
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
          <p style={{ color: brand.textLight, marginBottom: 32 }}>We have sent a confirmation to your email</p>

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
            </div>
            <div>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>TOTAL</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: brand.text }}>${total}</p>
              <p style={{ fontSize: 13, color: brand.textLight }}>Charged after service</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: brand.primary, border: 'none', borderRadius: 8, color: brand.text, textDecoration: 'none' }}>
              View My Bookings
            </Link>
            <Link href="/book" style={{ padding: '14px 28px', fontSize: 15, fontWeight: 600, background: brand.white, border: `1px solid ${brand.border}`, borderRadius: 8, color: brand.text, textDecoration: 'none' }}>
              Book Another
            </Link>
          </div>
          <p style={{ fontSize: 13, color: brand.textLight, marginTop: 32 }}>Questions? Contact us at hello@betterview.com</p>
        </main>
      )}
    </div>
  );
}
