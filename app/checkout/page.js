'use client';
import React, { useState } from 'react';
import Link from 'next/link';
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
  const [step, setStep] = useState('payment'); // 'payment' or 'confirmation'
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [saveCard, setSaveCard] = useState(true);
  const [processing, setProcessing] = useState(false);

  const brand = {
    primary: '#B8C5F2',
    text: '#1a1a1a',
    textLight: '#666',
    border: '#e0e0e0',
    bg: '#fafafa',
    white: '#ffffff',
    success: '#22c55e',
  };

  // Sample booking data (passed from booking flow)
  const booking = {
    building: 'Brickell Heights',
    unit: '2405',
    floorPlan: '2 Bed / 2 Bath',
    date: 'Sat, Feb 15, 2026',
    time: '11:00 AM – 2:00 PM',
    basePrice: 339,
    addOns: [
      { name: 'Balcony Glass', price: 49 }
    ],
  };

  const addOnsTotal = booking.addOns.reduce((sum, a) => sum + a.price, 0);
  const total = booking.basePrice + addOnsTotal;

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + ' / ' + v.substring(2, 4);
    }
    return v;
  };

  const handleSubmit = () => {
    setProcessing(true);
    // Simulate Stripe API call
    setTimeout(() => {
      setProcessing(false);
      setStep('confirmation');
    }, 2000);
  };

  const isFormValid = cardNumber.length >= 19 && expiry.length >= 7 && cvc.length >= 3 && name.length > 0;

  const inputStyle = {
    width: '100%',
    padding: '16px',
    fontSize: 16,
    border: `1px solid ${brand.border}`,
    borderRadius: 8,
    boxSizing: 'border-box',
    background: brand.white,
  };

  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: brand.text,
    marginBottom: 8,
  };

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      {/* Header */}
      <header style={{ 
        padding: '16px 32px', 
        background: brand.white,
        borderBottom: `1px solid ${brand.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 22, fontWeight: 600, color: brand.text }}>BetterView</span>
        </Link>
        <div style={{ fontSize: 14, color: brand.textLight }}>
          Secure checkout
        </div>
      </header>

      {/* Payment Step */}
      {step === 'payment' && (
        <main style={{ 
          maxWidth: 900,
          margin: '0 auto',
          padding: '48px 24px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 48
        }}>
          {/* Left - Payment Form */}
          <div>
            <h1 style={{ 
              fontSize: 24, 
              fontWeight: 600, 
              color: brand.text,
              marginBottom: 8
            }}>
              Payment Details
            </h1>
            <p style={{ 
              color: brand.textLight,
              marginBottom: 32
            }}>
              Your card will be charged after the cleaning is complete
            </p>

            <div style={{ 
              background: brand.white,
              borderRadius: 12,
              border: `1px solid ${brand.border}`,
              padding: 24
            }}>
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Name on card</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Card number</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    style={inputStyle}
                  />
                  <div style={{ 
                    position: 'absolute', 
                    right: 16, 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    gap: 8
                  }}>
                    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                      <rect width="32" height="20" rx="2" fill="#1A1F71"/>
                      <path d="M12.5 14L14.5 6H16.5L14.5 14H12.5Z" fill="white"/>
                      <path d="M20.5 6.2C20 6 19.3 5.8 18.5 5.8C16.5 5.8 15 6.9 15 8.4C15 9.5 16 10.1 16.7 10.5C17.5 10.9 17.7 11.2 17.7 11.5C17.7 12 17.1 12.2 16.5 12.2C15.7 12.2 15.2 12.1 14.5 11.8L14.2 11.7L14 13.2C14.5 13.4 15.3 13.6 16.3 13.6C18.5 13.6 19.9 12.5 19.9 10.9C19.9 10 19.3 9.3 18.2 8.8C17.5 8.4 17.1 8.2 17.1 7.8C17.1 7.5 17.5 7.1 18.2 7.1C18.8 7.1 19.3 7.2 19.6 7.4L19.8 7.5L20.5 6.2Z" fill="white"/>
                    </svg>
                    <svg width="32" height="20" viewBox="0 0 32 20" fill="none">
                      <rect width="32" height="20" rx="2" fill="#EB001B" fillOpacity="0.1"/>
                      <circle cx="12" cy="10" r="6" fill="#EB001B"/>
                      <circle cx="20" cy="10" r="6" fill="#F79E1B"/>
                      <path d="M16 5.8C17.3 6.9 18 8.4 18 10C18 11.6 17.3 13.1 16 14.2C14.7 13.1 14 11.6 14 10C14 8.4 14.7 6.9 16 5.8Z" fill="#FF5F00"/>
                    </svg>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div>
                  <label style={labelStyle}>Expiry date</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    placeholder="MM / YY"
                    maxLength={7}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="123"
                    maxLength={4}
                    style={inputStyle}
                  />
                </div>
              </div>

              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                cursor: 'pointer',
                paddingTop: 16,
                borderTop: `1px solid ${brand.border}`
              }}>
                <input
                  type="checkbox"
                  checked={saveCard}
                  onChange={(e) => setSaveCard(e.target.checked)}
                  style={{ width: 18, height: 18 }}
                />
                <span style={{ fontSize: 14, color: brand.text }}>
                  Save card for future bookings
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!isFormValid || processing}
              style={{
                width: '100%',
                marginTop: 24,
                padding: 18,
                fontSize: 16,
                fontWeight: 600,
                background: isFormValid && !processing ? brand.text : brand.border,
                border: 'none',
                borderRadius: 8,
                color: isFormValid && !processing ? brand.white : '#999',
                cursor: isFormValid && !processing ? 'pointer' : 'not-allowed'
              }}
            >
              {processing ? 'Processing...' : 'Confirm Booking'}
            </button>

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 8,
              marginTop: 16 
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.textLight} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span style={{ fontSize: 13, color: brand.textLight }}>
                Secured by Stripe. Your card info is encrypted.
              </span>
            </div>
          </div>

          {/* Right - Order Summary */}
          <div>
            <div style={{ 
              background: brand.white,
              borderRadius: 12,
              border: `1px solid ${brand.border}`,
              padding: 24,
              position: 'sticky',
              top: 24
            }}>
              <h3 style={{ 
                fontSize: 16, 
                fontWeight: 600, 
                color: brand.text,
                marginBottom: 20
              }}>
                Booking Summary
              </h3>

              <div style={{ marginBottom: 20 }}>
                <p style={{ fontWeight: 600, color: brand.text, marginBottom: 4 }}>
                  {booking.building}
                </p>
                <p style={{ fontSize: 14, color: brand.textLight }}>
                  Unit {booking.unit} · {booking.floorPlan}
                </p>
              </div>

              <div style={{ 
                background: brand.bg,
                borderRadius: 8,
                padding: 12,
                marginBottom: 20
              }}>
                <p style={{ fontWeight: 500, color: brand.text, marginBottom: 2 }}>
                  {booking.date}
                </p>
                <p style={{ fontSize: 14, color: brand.textLight }}>
                  {booking.time}
                </p>
              </div>

              <div style={{ borderTop: `1px solid ${brand.border}`, paddingTop: 16 }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  fontSize: 14
                }}>
                  <span style={{ color: brand.textLight }}>Window cleaning</span>
                  <span style={{ color: brand.text }}>${booking.basePrice}</span>
                </div>

                {booking.addOns.map((addon, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginBottom: 12,
                    fontSize: 14
                  }}>
                    <span style={{ color: brand.textLight }}>{addon.name}</span>
                    <span style={{ color: brand.text }}>${addon.price}</span>
                  </div>
                ))}

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  paddingTop: 16,
                  marginTop: 8,
                  borderTop: `1px solid ${brand.border}`
                }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>Total</span>
                  <span style={{ fontSize: 20, fontWeight: 700, color: brand.text }}>${total}</span>
                </div>
              </div>

              <p style={{ 
                fontSize: 12, 
                color: brand.textLight, 
                marginTop: 16,
                padding: 12,
                background: brand.bg,
                borderRadius: 6
              }}>
                Your card will be saved and charged <strong>${total}</strong> after your cleaning is complete. Free cancellation up to 24 hours before.
              </p>
            </div>
          </div>
        </main>
      )}

      {/* Confirmation Step */}
      {step === 'confirmation' && (
        <main style={{ 
          maxWidth: 500,
          margin: '0 auto',
          padding: '80px 24px',
          textAlign: 'center'
        }}>
          <div style={{ 
            width: 80,
            height: 80,
            background: brand.success,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>

          <h1 style={{ 
            fontSize: 28, 
            fontWeight: 600, 
            color: brand.text,
            marginBottom: 8
          }}>
            Booking Confirmed!
          </h1>
          <p style={{ 
            color: brand.textLight,
            marginBottom: 32
          }}>
            We've sent a confirmation to your email
          </p>

          <div style={{ 
            background: brand.white,
            borderRadius: 12,
            border: `1px solid ${brand.border}`,
            padding: 24,
            textAlign: 'left',
            marginBottom: 32
          }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>PROPERTY</p>
              <p style={{ fontWeight: 600, color: brand.text }}>{booking.building}</p>
              <p style={{ fontSize: 14, color: brand.textLight }}>Unit {booking.unit}</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>DATE & TIME</p>
              <p style={{ fontWeight: 600, color: brand.text }}>{booking.date}</p>
              <p style={{ fontSize: 14, color: brand.textLight }}>{booking.time}</p>
            </div>

            <div>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>TOTAL</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: brand.text }}>${total}</p>
              <p style={{ fontSize: 13, color: brand.textLight }}>Charged after service</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/dashboard" style={{
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              background: brand.primary,
              border: 'none',
              borderRadius: 8,
              color: brand.text,
              cursor: 'pointer',
              textDecoration: 'none'
            }}>
              View My Bookings
            </Link>
            <Link href="/book" style={{
              padding: '14px 28px',
              fontSize: 15,
              fontWeight: 600,
              background: brand.white,
              border: `1px solid ${brand.border}`,
              borderRadius: 8,
              color: brand.text,
              cursor: 'pointer',
              textDecoration: 'none'
            }}>
              Book Another
            </Link>
          </div>

          <p style={{ 
            fontSize: 13, 
            color: brand.textLight,
            marginTop: 32
          }}>
            Questions? Contact us at hello@betterview.com
          </p>
        </main>
      )}
    </div>
  );
}
