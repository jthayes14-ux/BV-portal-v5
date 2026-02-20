'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('address');

  // Address fields
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Payment fields
  const [cardLast4, setCardLast4] = useState('');
  const [cardBrand, setCardBrand] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa',
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user) loadProfile();
  }, [authLoading, user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setAddress(data.address || '');
      setCity(data.city || '');
      setState(data.state || '');
      setZip(data.zip || '');
      setCardLast4(data.card_last4 || '');
      setCardBrand(data.card_brand || '');
    }
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const { error: upsertError } = await supabase
      .from('customer_profiles')
      .upsert({
        user_id: user.id,
        address,
        city,
        state,
        zip,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (upsertError) {
      setError('Failed to save address. Please try again.');
    } else {
      setMessage('Address saved successfully.');
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase();
  const userName = user?.user_metadata?.full_name || '';
  const userEmail = user?.email || '';

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}>
        <p style={{ color: brand.textLight }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      <header className="dashboard-header" style={{ padding: '16px 32px', background: 'white', borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
        </Link>
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/book" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: brand.primary, border: 'none', borderRadius: 6, color: brand.text, textDecoration: 'none' }}>
            Book a Cleaning
          </Link>
          <div style={{ position: 'relative' }}>
            <div onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={{ width: 36, height: 36, background: brand.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: brand.text, cursor: 'pointer', userSelect: 'none' }}>
              {userInitial}
            </div>
            {profileMenuOpen && (
              <>
                <div onClick={() => setProfileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'white', borderRadius: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.12)', border: `1px solid ${brand.border}`, minWidth: 180, zIndex: 100, overflow: 'hidden' }}>
                  <Link href="/dashboard/settings" onClick={() => setProfileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', fontSize: 14, fontWeight: 500, color: brand.text, textDecoration: 'none', borderBottom: `1px solid ${brand.border}` }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Settings
                  </Link>
                  <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', fontSize: 14, fontWeight: 500, color: '#DC2626', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                    Log Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <button className="mobile-nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          )}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <Link href="/book" onClick={() => setMobileMenuOpen(false)} style={{ padding: '14px 16px', fontSize: 16, fontWeight: 500, background: brand.primary, border: 'none', borderRadius: 8, color: brand.text, textDecoration: 'none', textAlign: 'center' }}>
            Book a Cleaning
          </Link>
          <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} style={{ padding: '14px 16px', fontSize: 16, fontWeight: 500, background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: 8, color: brand.text, textDecoration: 'none', textAlign: 'center' }}>
            Settings
          </Link>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ padding: '14px 16px', fontSize: 16, fontWeight: 500, background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: 8, color: '#DC2626', cursor: 'pointer' }}>
            Log Out
          </button>
        </div>
      </header>

      <main className="dashboard-main" style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 32 }}>
          <Link href="/dashboard" style={{ fontSize: 14, color: brand.textLight, textDecoration: 'none' }}>
            &larr; Back to My Bookings
          </Link>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Settings</h1>
        <p style={{ fontSize: 15, color: brand.textLight, marginBottom: 32 }}>Manage your address and payment information</p>

        {/* Profile info */}
        <div style={{ background: 'white', borderRadius: 12, border: `1px solid ${brand.border}`, padding: '24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 48, height: 48, background: brand.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 600, color: brand.text, flexShrink: 0 }}>
              {userInitial}
            </div>
            <div>
              {userName && <p style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>{userName}</p>}
              <p style={{ fontSize: 14, color: brand.textLight }}>{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `1px solid ${brand.border}` }}>
          <button onClick={() => { setActiveSection('address'); setMessage(''); setError(''); }} style={{ padding: '12px 24px', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', borderBottom: activeSection === 'address' ? `2px solid ${brand.text}` : '2px solid transparent', color: activeSection === 'address' ? brand.text : brand.textLight, cursor: 'pointer', marginBottom: -1 }}>
            Address
          </button>
          <button onClick={() => { setActiveSection('payment'); setMessage(''); setError(''); }} style={{ padding: '12px 24px', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', borderBottom: activeSection === 'payment' ? `2px solid ${brand.text}` : '2px solid transparent', color: activeSection === 'payment' ? brand.text : brand.textLight, cursor: 'pointer', marginBottom: -1 }}>
            Payment
          </button>
        </div>

        {message && (
          <div style={{ padding: '12px 16px', background: '#DCFCE7', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#16A34A' }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#DC2626' }}>
            {error}
          </div>
        )}

        {activeSection === 'address' && (
          <div style={{ background: 'white', borderRadius: 12, border: `1px solid ${brand.border}`, padding: '32px 24px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 24 }}>Address</h2>
            <form onSubmit={handleSaveAddress}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Street Address</label>
                <input
                  type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, Apt 4B"
                  style={{ width: '100%', padding: '14px 16px', border: `1px solid ${brand.border}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = brand.primary}
                  onBlur={(e) => e.target.style.borderColor = brand.border}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>City</label>
                  <input
                    type="text" value={city} onChange={(e) => setCity(e.target.value)}
                    placeholder="Miami"
                    style={{ width: '100%', padding: '14px 16px', border: `1px solid ${brand.border}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = brand.primary}
                    onBlur={(e) => e.target.style.borderColor = brand.border}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>State</label>
                  <input
                    type="text" value={state} onChange={(e) => setState(e.target.value)}
                    placeholder="FL"
                    style={{ width: '100%', padding: '14px 16px', border: `1px solid ${brand.border}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = brand.primary}
                    onBlur={(e) => e.target.style.borderColor = brand.border}
                  />
                </div>
              </div>
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>ZIP Code</label>
                <input
                  type="text" value={zip} onChange={(e) => setZip(e.target.value)}
                  placeholder="33101"
                  style={{ width: '100%', maxWidth: 160, padding: '14px 16px', border: `1px solid ${brand.border}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = brand.primary}
                  onBlur={(e) => e.target.style.borderColor = brand.border}
                />
              </div>
              <button
                type="submit" disabled={saving}
                style={{
                  padding: '14px 32px', fontSize: 15, fontWeight: 600,
                  background: saving ? '#e0e0e0' : brand.text,
                  color: saving ? brand.textLight : 'white',
                  border: 'none', borderRadius: 8,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Save Address'}
              </button>
            </form>
          </div>
        )}

        {activeSection === 'payment' && (
          <div style={{ background: 'white', borderRadius: 12, border: `1px solid ${brand.border}`, padding: '32px 24px' }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 24 }}>Payment Method</h2>
            {cardLast4 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px', background: brand.bg, borderRadius: 10, border: `1px solid ${brand.border}` }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={brand.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: brand.text }}>{cardBrand || 'Card'} ending in {cardLast4}</p>
                  <p style={{ fontSize: 13, color: brand.textLight }}>Update your payment method during your next booking</p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 24px' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={brand.textLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
                <p style={{ fontSize: 15, color: brand.textLight, marginBottom: 8 }}>No payment method on file</p>
                <p style={{ fontSize: 13, color: brand.textLight }}>Your payment information will be saved when you complete your first booking</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
