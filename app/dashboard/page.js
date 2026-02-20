'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
    </div>
  );
}

export default function CustomerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCancelledSkipped, setShowCancelledSkipped] = useState(false);

  // Reschedule state
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  const timeSlots = [
    '8:00 AM – 11:00 AM',
    '11:00 AM – 2:00 PM',
    '2:00 PM – 5:00 PM',
    '5:00 PM – 8:00 PM',
  ];

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa', success: '#22c55e', gold: '#C9B037',
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  const loadData = async () => {
    const [bkRes, fqRes] = await Promise.all([
      supabase.from('bookings').select('*').eq('user_id', user.id).order('booking_date', { ascending: false }).limit(10000),
      supabase.from('frequencies').select('*').order('sort_order'),
    ]);
    setBookings(bkRes.data || []);
    setFrequencies(fqRes.data || []);
    setDataLoading(false);
  };

  const getFrequencyName = (frequencyId) => {
    return frequencies.find(f => f.id === frequencyId)?.name || '';
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const today = new Date().toISOString().split('T')[0];

  const openReschedule = (booking) => {
    setRescheduleBooking(booking);
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleError('');
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please select both a date and time');
      return;
    }
    setRescheduling(true);
    setRescheduleError('');

    const { error } = await supabase
      .from('bookings')
      .update({ booking_date: rescheduleDate, booking_time: rescheduleTime })
      .eq('id', rescheduleBooking.id);

    if (error) {
      setRescheduleError('Failed to reschedule. Please try again.');
      setRescheduling(false);
      return;
    }

    setBookings(bookings.map(b =>
      b.id === rescheduleBooking.id
        ? { ...b, booking_date: rescheduleDate, booking_time: rescheduleTime }
        : b
    ));
    setRescheduleBooking(null);
    setRescheduling(false);
  };

  const handleBookAgain = (booking) => {
    const rebookData = {
      neighborhood_id: booking.neighborhood,
      building_id: booking.building_id,
      building_name: booking.building,
      floor_plan_id: booking.floor_plan_id,
      floor_plan_name: booking.floor_plan,
      unit_number: booking.unit_number,
      guest_first_name: booking.guest_first_name || booking.customer_name?.split(' ')[0] || '',
      guest_last_name: booking.guest_last_name || booking.customer_name?.split(' ').slice(1).join(' ') || '',
      guest_email: booking.guest_email || booking.customer_email || '',
      guest_phone: booking.guest_phone || '',
    };
    localStorage.setItem('rebookInfo', JSON.stringify(rebookData));
    router.push('/book?rebook=true');
  };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'scheduled');
  const pastBookings = bookings.filter(b => {
    if (b.status === 'completed') return true;
    if ((b.status === 'skipped' || b.status === 'cancelled') && showCancelledSkipped) return true;
    return false;
  });
  const cancelledSkippedCount = bookings.filter(b => b.status === 'skipped' || b.status === 'cancelled').length;
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const userInitial = (user?.user_metadata?.full_name || user?.email || 'U').charAt(0).toUpperCase();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'upcoming': return { background: brand.primary, color: brand.text };
      case 'scheduled': return { background: '#DBEAFE', color: '#1E40AF' };
      case 'completed': return { background: '#e8e8e8', color: brand.text };
      case 'skipped': return { background: '#FEF3C7', color: '#92400E' };
      case 'cancelled': return { background: '#FEE2E2', color: '#DC2626' };
      default: return { background: '#e8e8e8', color: brand.text };
    }
  };

  // Group bookings by recurring_group_id
  const groupRecurring = (bks) => {
    const groups = {};
    const standalone = [];
    for (const b of bks) {
      if (b.recurring_group_id) {
        if (!groups[b.recurring_group_id]) groups[b.recurring_group_id] = [];
        groups[b.recurring_group_id].push(b);
      } else {
        standalone.push(b);
      }
    }
    for (const gid of Object.keys(groups)) {
      groups[gid].sort((a, b) => a.booking_date.localeCompare(b.booking_date));
    }
    return { groups, standalone };
  };

  const { groups, standalone } = groupRecurring(displayedBookings);

  if (authLoading || dataLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}>
        <p style={{ color: brand.textLight }}>Loading...</p>
      </div>
    );
  }

  const renderBookingCard = (booking) => {
    const freqName = getFrequencyName(booking.frequency_id);
    const statusStyle = getStatusStyle(booking.status);

    return (
      <div key={booking.id} style={{ background: 'white', borderRadius: 12, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
        <div className="booking-card-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 4 }}>{booking.building}</h3>
            <p style={{ fontSize: 14, color: brand.textLight }}>Unit {booking.unit_number} · {booking.floor_plan}</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {freqName && freqName !== 'One-Time' && (
              <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#F5F0DC', color: '#A69028' }}>
                {freqName}
              </span>
            )}
            <span style={{ padding: '6px 12px', borderRadius: 100, fontSize: 13, fontWeight: 500, ...statusStyle }}>
              {booking.status}
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
            {booking.frequency_discount > 0 && (
              <p style={{ fontSize: 11, color: brand.gold }}>Freq. discount: -${booking.frequency_discount}</p>
            )}
            {booking.add_ons && booking.add_ons.length > 0 && (
              <p style={{ fontSize: 13, color: brand.textLight }}>+{booking.add_ons.map(a => a.name).join(', ')}</p>
            )}
          </div>
        </div>

        <div className="booking-card-actions" style={{ padding: '16px 24px', borderTop: `1px solid ${brand.border}`, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {(booking.status === 'upcoming' || booking.status === 'scheduled') && (
            <>
              <button onClick={() => openReschedule(booking)} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'white', border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: brand.text }}>Reschedule</button>
              <button onClick={async () => {
                if (confirm('Cancel this booking?')) {
                  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
                  setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
                }
              }} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'white', border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: '#dc2626' }}>Cancel</button>
            </>
          )}
          {(booking.status === 'completed' || booking.status === 'skipped' || booking.status === 'cancelled') && (
            <>
              <button onClick={() => handleBookAgain(booking)} style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: brand.primary, border: 'none', borderRadius: 6, cursor: 'pointer', color: brand.text }}>Book Again</button>
              <button style={{ padding: '10px 20px', fontSize: 14, fontWeight: 500, background: 'white', border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: brand.text }}>View Receipt</button>
            </>
          )}
        </div>
      </div>
    );
  };

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

        {activeTab === 'past' && cancelledSkippedCount > 0 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: brand.textLight, cursor: 'pointer' }}>
              <input type="checkbox" checked={showCancelledSkipped} onChange={(e) => setShowCancelledSkipped(e.target.checked)} style={{ cursor: 'pointer' }} />
              Show cancelled &amp; skipped ({cancelledSkippedCount})
            </label>
          </div>
        )}

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
            {/* Recurring groups */}
            {Object.entries(groups).map(([groupId, groupBookings]) => (
              <div key={groupId} style={{ border: `2px solid ${brand.gold}`, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ padding: '10px 20px', background: '#FFFBEB', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>&#x21BB;</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#92400E' }}>
                    Recurring Series ({groupBookings.length} bookings)
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {groupBookings.map(b => renderBookingCard(b))}
                </div>
              </div>
            ))}
            {/* Standalone bookings */}
            {standalone.map(b => renderBookingCard(b))}
          </div>
        )}
      </main>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
          <div style={{ background: 'white', borderRadius: 16, maxWidth: 440, width: '100%', padding: 32, position: 'relative' }}>
            <button onClick={() => setRescheduleBooking(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: brand.textLight, lineHeight: 1 }}>
              &times;
            </button>

            <h2 style={{ fontSize: 22, fontWeight: 600, color: brand.text, marginBottom: 4 }}>Reschedule Booking</h2>
            <p style={{ fontSize: 14, color: brand.textLight, marginBottom: 24 }}>
              {rescheduleBooking.building} &middot; Unit {rescheduleBooking.unit_number}
            </p>

            <div style={{ background: brand.bg, borderRadius: 10, padding: 16, marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: brand.textLight, marginBottom: 4 }}>CURRENT DATE & TIME</p>
              <p style={{ fontSize: 15, fontWeight: 500, color: brand.text }}>{formatDate(rescheduleBooking.booking_date)}</p>
              <p style={{ fontSize: 14, color: brand.textLight }}>{rescheduleBooking.booking_time}</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: brand.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={today}
                style={{ width: '100%', padding: '14px 16px', fontSize: 15, border: `1px solid ${brand.border}`, borderRadius: 10, boxSizing: 'border-box', background: 'white' }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: brand.textLight, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Time</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {timeSlots.map(slot => (
                  <button
                    key={slot}
                    onClick={() => setRescheduleTime(slot)}
                    style={{
                      padding: '12px 10px', fontSize: 13, fontWeight: 500,
                      border: rescheduleTime === slot ? `2px solid ${brand.gold}` : `1px solid ${brand.border}`,
                      borderRadius: 10, cursor: 'pointer',
                      background: rescheduleTime === slot ? '#FFFBEB' : 'white',
                      color: rescheduleTime === slot ? '#92400E' : brand.text,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {rescheduleError && (
              <p style={{ fontSize: 13, color: '#DC2626', marginBottom: 16 }}>{rescheduleError}</p>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => setRescheduleBooking(null)}
                style={{ flex: 1, padding: '14px', fontSize: 15, fontWeight: 500, background: 'white', border: `1px solid ${brand.border}`, borderRadius: 10, cursor: 'pointer', color: brand.text }}
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                style={{
                  flex: 1, padding: '14px', fontSize: 15, fontWeight: 600,
                  background: rescheduleDate && rescheduleTime && !rescheduling ? brand.text : brand.border,
                  color: rescheduleDate && rescheduleTime && !rescheduling ? 'white' : '#999',
                  border: 'none', borderRadius: 10,
                  cursor: rescheduleDate && rescheduleTime && !rescheduling ? 'pointer' : 'not-allowed',
                }}
              >
                {rescheduling ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
