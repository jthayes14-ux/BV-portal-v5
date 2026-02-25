'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      <div style={{ width: 4, height: 22, background: '#000', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#000', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#000', borderRadius: 1 }} />
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('address');
  const [editingAddress, setEditingAddress] = useState(false);

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

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user) loadProfile();
  }, [authLoading, user]);

  const loadProfile = async () => {
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) {
      setAddress(data.address || '');
      setCity(data.city || '');
      setState(data.state || '');
      setZip(data.zip || '');
      setSavedAddress(data.address || '');
      setSavedCity(data.city || '');
      setSavedState(data.state || '');
      setSavedZip(data.zip || '');
      setCardLast4(data.card_last4 || '');
      setCardBrand(data.card_brand || '');
    }
  };

  // Keep original values for cancel
  const [savedAddress, setSavedAddress] = useState('');
  const [savedCity, setSavedCity] = useState('');
  const [savedState, setSavedState] = useState('');
  const [savedZip, setSavedZip] = useState('');

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({
        address,
        city,
        state,
        zip,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (updateError) {
      setError('Failed to save address. Please try again.');
    } else {
      setMessage('Address saved successfully.');
      setSavedAddress(address);
      setSavedCity(city);
      setSavedState(state);
      setSavedZip(zip);
      setEditingAddress(false);
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setAddress(savedAddress);
    setCity(savedCity);
    setState(savedState);
    setZip(savedZip);
    setEditingAddress(false);
    setError('');
    setMessage('');
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #f0f0f0', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6b6b6b', fontSize: 15 }}>Loading...</p>
        </div>
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header className="dashboard-header" style={{
        padding: '14px 24px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#000', letterSpacing: '-0.02em' }}>BetterView</span>
        </Link>
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/book" style={{
            padding: '10px 24px', fontSize: 14, fontWeight: 600,
            background: '#000', borderRadius: 100, color: '#fff', textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}>
            Book a Cleaning
          </Link>
          <div style={{ position: 'relative' }}>
            <div onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={{
              width: 36, height: 36, background: '#000', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 600, color: '#fff', cursor: 'pointer', userSelect: 'none',
              transition: 'opacity 0.2s',
            }}>
              {userInitial}
            </div>
            {profileMenuOpen && (
              <>
                <div onClick={() => setProfileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: '#fff', borderRadius: 16,
                  boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                  minWidth: 200, zIndex: 100, overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <Link href="/dashboard/settings" onClick={() => setProfileMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
                    fontSize: 15, fontWeight: 500, color: '#000', textDecoration: 'none',
                    borderBottom: '1px solid #f0f0f0', transition: 'background 0.15s',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Settings
                  </Link>
                  <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
                    fontSize: 15, fontWeight: 500, color: '#dc2626', background: 'none',
                    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                    transition: 'background 0.15s',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
          <Link href="/book" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '16px', fontSize: 16, fontWeight: 600,
            background: '#000', border: 'none', borderRadius: 12,
            color: '#fff', textDecoration: 'none', textAlign: 'center'
          }}>
            Book a Cleaning
          </Link>
          <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '16px', fontSize: 16, fontWeight: 500,
            background: '#f5f5f5', border: 'none', borderRadius: 12,
            color: '#000', textDecoration: 'none', textAlign: 'center'
          }}>
            Settings
          </Link>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{
            padding: '16px', fontSize: 16, fontWeight: 500,
            background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 12,
            color: '#dc2626', cursor: 'pointer'
          }}>
            Log Out
          </button>
        </div>
      </header>

      <main className="dashboard-main" style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
        {/* Back link */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/dashboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            fontSize: 14, fontWeight: 500, color: '#6b6b6b', textDecoration: 'none',
            transition: 'color 0.15s',
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
            Back to My Bookings
          </Link>
        </div>

        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#000', marginBottom: 8, letterSpacing: '-0.02em' }}>Settings</h1>
        <p style={{ fontSize: 15, color: '#6b6b6b', marginBottom: 32 }}>Manage your address and payment information</p>

        {/* Profile info */}
        <div style={{
          background: '#fafafa', borderRadius: 20, padding: '28px',
          marginBottom: 28,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 52, height: 52, background: '#000', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {userInitial}
            </div>
            <div>
              {userName && <p style={{ fontSize: 17, fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>{userName}</p>}
              <p style={{ fontSize: 14, color: '#6b6b6b', marginTop: 2 }}>{userEmail}</p>
            </div>
          </div>
        </div>

        {/* Section tabs - pill-style segmented control */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 28, background: '#f5f5f5', borderRadius: 12, padding: 4 }}>
          <button onClick={() => { setActiveSection('address'); setMessage(''); setError(''); }} style={{
            flex: 1, padding: '12px 20px', fontSize: 14, fontWeight: 600,
            background: activeSection === 'address' ? '#000' : 'transparent',
            color: activeSection === 'address' ? '#fff' : '#6b6b6b',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            Address
          </button>
          <button onClick={() => { setActiveSection('payment'); setMessage(''); setError(''); }} style={{
            flex: 1, padding: '12px 20px', fontSize: 14, fontWeight: 600,
            background: activeSection === 'payment' ? '#000' : 'transparent',
            color: activeSection === 'payment' ? '#fff' : '#6b6b6b',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            Payment
          </button>
        </div>

        {message && (
          <div style={{
            padding: '14px 18px', background: '#DCFCE7', borderRadius: 14,
            marginBottom: 20, fontSize: 14, fontWeight: 500, color: '#16A34A',
          }}>
            {message}
          </div>
        )}
        {error && (
          <div style={{
            padding: '14px 18px', background: '#FEE2E2', borderRadius: 14,
            marginBottom: 20, fontSize: 14, fontWeight: 500, color: '#DC2626',
          }}>
            {error}
          </div>
        )}

        {activeSection === 'address' && (
          <div style={{ background: '#fafafa', borderRadius: 20, padding: '32px 28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#000', letterSpacing: '-0.01em' }}>Address</h2>
              {!editingAddress && (
                <button
                  onClick={() => { setEditingAddress(true); setMessage(''); setError(''); }}
                  style={{
                    padding: '10px 24px', fontSize: 14, fontWeight: 600,
                    background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 100,
                    cursor: 'pointer', color: '#000', transition: 'all 0.2s',
                  }}
                >
                  Edit
                </button>
              )}
            </div>

            {!editingAddress ? (
              /* Read-only display */
              address || city || state || zip ? (
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '20px', background: '#fff', borderRadius: 16,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, background: '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    {address && <p style={{ fontSize: 15, fontWeight: 600, color: '#000', marginBottom: 4 }}>{address}</p>}
                    {(city || state || zip) && (
                      <p style={{ fontSize: 14, color: '#6b6b6b' }}>
                        {[city, state].filter(Boolean).join(', ')}{zip ? ` ${zip}` : ''}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: 20, background: '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <p style={{ fontSize: 16, fontWeight: 600, color: '#000', marginBottom: 6 }}>No address on file</p>
                  <p style={{ fontSize: 14, color: '#6b6b6b', marginBottom: 24, lineHeight: 1.5 }}>Your address will be added automatically when you complete your first booking</p>
                  <button
                    onClick={() => setEditingAddress(true)}
                    style={{
                      padding: '14px 32px', fontSize: 15, fontWeight: 600,
                      background: '#000', border: 'none', borderRadius: 100,
                      cursor: 'pointer', color: '#fff', transition: 'opacity 0.2s',
                    }}
                  >
                    Add Address
                  </button>
                </div>
              )
            ) : (
              /* Edit mode */
              <form onSubmit={handleSaveAddress}>
                <div style={{ marginBottom: 24 }}>
                  <label style={{
                    display: 'block', fontSize: 13, fontWeight: 700, color: '#000',
                    marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>Street Address</label>
                  <input
                    type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                    placeholder="123 Main St, Unit 4B"
                    style={{
                      width: '100%', padding: '16px 18px', border: '1.5px solid #e5e5e5',
                      borderRadius: 14, fontSize: 15, boxSizing: 'border-box', outline: 'none',
                      background: '#fff', transition: 'border-color 0.2s',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                  <div>
                    <label style={{
                      display: 'block', fontSize: 13, fontWeight: 700, color: '#000',
                      marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>City</label>
                    <input
                      type="text" value={city} onChange={(e) => setCity(e.target.value)}
                      placeholder="Miami"
                      style={{
                        width: '100%', padding: '16px 18px', border: '1.5px solid #e5e5e5',
                        borderRadius: 14, fontSize: 15, boxSizing: 'border-box', outline: 'none',
                        background: '#fff', transition: 'border-color 0.2s',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#000'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block', fontSize: 13, fontWeight: 700, color: '#000',
                      marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>State</label>
                    <input
                      type="text" value={state} onChange={(e) => setState(e.target.value)}
                      placeholder="FL"
                      style={{
                        width: '100%', padding: '16px 18px', border: '1.5px solid #e5e5e5',
                        borderRadius: 14, fontSize: 15, boxSizing: 'border-box', outline: 'none',
                        background: '#fff', transition: 'border-color 0.2s',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#000'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                    />
                  </div>
                </div>
                <div style={{ marginBottom: 32 }}>
                  <label style={{
                    display: 'block', fontSize: 13, fontWeight: 700, color: '#000',
                    marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em',
                  }}>ZIP Code</label>
                  <input
                    type="text" value={zip} onChange={(e) => setZip(e.target.value)}
                    placeholder="33101"
                    style={{
                      width: '100%', maxWidth: 160, padding: '16px 18px', border: '1.5px solid #e5e5e5',
                      borderRadius: 14, fontSize: 15, boxSizing: 'border-box', outline: 'none',
                      background: '#fff', transition: 'border-color 0.2s',
                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#000'}
                    onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit" disabled={saving}
                    style={{
                      padding: '14px 32px', fontSize: 15, fontWeight: 600,
                      background: saving ? '#e5e5e5' : '#000',
                      color: saving ? '#999' : '#fff',
                      border: 'none', borderRadius: 100,
                      cursor: saving ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {saving ? 'Saving...' : 'Save Address'}
                  </button>
                  <button
                    type="button" onClick={handleCancelEdit}
                    style={{
                      padding: '14px 24px', fontSize: 15, fontWeight: 600,
                      background: '#fff', color: '#000',
                      border: '1.5px solid #e5e5e5', borderRadius: 100,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeSection === 'payment' && (
          <div style={{ background: '#fafafa', borderRadius: 20, padding: '32px 28px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#000', letterSpacing: '-0.01em', marginBottom: 24 }}>Payment Method</h2>
            {cardLast4 ? (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '20px', background: '#fff', borderRadius: 16,
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>{cardBrand || 'Card'} ending in {cardLast4}</p>
                  <p style={{ fontSize: 13, color: '#6b6b6b', marginTop: 4 }}>Update your payment method during your next booking</p>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div style={{
                  width: 64, height: 64, borderRadius: 20, background: '#f0f0f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 20px',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                  </svg>
                </div>
                <p style={{ fontSize: 16, fontWeight: 600, color: '#000', marginBottom: 6 }}>No payment method on file</p>
                <p style={{ fontSize: 14, color: '#6b6b6b', lineHeight: 1.5 }}>Your payment information will be saved when you complete your first booking</p>
              </div>
            )}
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
