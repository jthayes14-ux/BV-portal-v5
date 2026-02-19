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

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa', success: '#22c55e',
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user) loadBookings();
  }, [authLoading, user]);

  const loadBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false });
    setBookings(data || []);
    setDataLoading(false);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const pastBookings = bookings.filter(b => b.status === 'completed');
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  if (authLoading || dataLoading) {
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
          <div onClick={handleLogout} style={{ width: 36, height: 36, background: brand.primary, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 600, color: brand.text, cursor: 'pointer' }}>
            {userInitial}
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
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ padding: '14px 16px', fontSize: 16, fontWeight: 500, background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: 8, color: brand.text, cursor: 'pointer' }}>
            Log Out
          </button>
        </div>
      </header>

      <main className="dashboard-main" style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: brand.text, marginBottom: 32 }}>My Bookings</h1>

        <div style={{ display: 'flex', gap: 0, marginBottom: 32, borderBottom: `1px solid ${brand.border}` }}>
          <button onClick={() => setActiveTab('upcoming')} style={{ padding: '12px 24px', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', borderBottom: activeTab === 'upcoming' ? `2px solid ${brand.text}` : '2px solid transparent', color: activeTab === 'upcoming' ? brand.text : brand.textLight, cursor: 'pointer', marginBottom: -1 }}>
            Upcoming ({upcomingBookings.length})
          </button>
          <button onClick={() => setActiveTab('past')} style={{ padding: '12px 24px', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', borderBottom: activeTab === 'past' ? `2px solid ${brand.text}` : '2px solid transparent', color: activeTab === 'past' ? brand.text : brand.textLight, cursor: 'pointer', marginBottom: -1 }}>
            Past ({pastBookings.length})
          </button>
        </div>

        {displayedBookings.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: 'white', borderRadius: 12, border: `1px solid ${brand.border}` }}>
            <p style={{ color: brand.textLight, marginBottom: 24 }}>
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
            {activeTab === 'upcoming' && (
              <Link href="/book" style={{ padding: '12px 24px', fontSize: 15, fontWeight: 500, background: brand.primary, border: 'none', borderRadius: 6, color: brand.text, textDecoration: 'none' }}>
                Book a Cleaning
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayedBookings.map(booking => (
              <div key={booking.id} style={{ background: 'white', borderRadius: 12, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                <div className="booking-card-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 4 }}>{booking.building}</h3>
                    <p style={{ fontSize: 14, color: brand.textLight }}>Unit {booking.unit_number} · {booking.floor_plan}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {booking.recurrence && booking.recurrence !== 'one-time' && (
                      <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#F5F0DC', color: '#A69028' }}>
                        {booking.recurrence}
                      </span>
                    )}
                    <span style={{ padding: '6px 12px', borderRadius: 100, fontSize: 13, fontWeight: 500, background: booking.status === 'upcoming' ? brand.primary : '#e8e8e8', color: brand.text }}>
                      {booking.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                    </span>
                  </div>
                </div>

                <div className="booking-details-row" style={{ padding: '16px 24px', background: brand.bg, borderTop: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: brand.text }}>{formatDate(booking.booking_date)}</p>
                    <p style={{ fontSize: 14, color: brand.textLight }}>{booking.booking_time}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: brand.text }}>${booking.total_price}</p>
                    {booking.add_ons && booking.add_ons.length > 0 && (
                      <p style={{ fontSize: 13, color: brand.textLight }}>+{booking.add_ons.map(a => a.name).join(', ')}</p>
                    )}
                  </div>
                </div>

                <div className="booking-card-actions" style={{ padding: '16px 24px', borderTop: `1px solid ${brand.border}`, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {booking.status === 'upcoming' && (
                    <>
                      <button style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'white', border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: brand.text }}>Reschedule</button>
                      <button style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'white', border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: '#dc2626' }}>Cancel</button>
                    </>
                  )}
                  {booking.status === 'completed' && (
                    <>
                      <Link href="/book" style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: brand.primary, border: 'none', borderRadius: 6, color: brand.text, textDecoration: 'none' }}>Book Again</Link>
                      <button style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'white', border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: brand.text }}>View Receipt</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
