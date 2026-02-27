'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      <div style={{ width: 4, height: 22, background: '#6366F1', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#6366F1', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#6366F1', borderRadius: 1 }} />
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
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
      case 'upcoming': return { background: '#DBEAFE', color: '#1E40AF' };
      case 'scheduled': return { background: '#EEF2FF', color: '#4338CA' };
      case 'completed': return { background: '#D1FAE5', color: '#065F46' };
      case 'skipped': return { background: '#FEF3C7', color: '#92400E' };
      case 'cancelled': return { background: '#FEE2E2', color: '#991B1B' };
      default: return { background: '#F3F4F6', color: '#6B7280' };
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
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E5E7EB', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#6B7280', fontSize: 15 }}>Loading...</p>
        </div>
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderBookingCard = (booking) => {
    const freqName = getFrequencyName(booking.frequency_id);
    const statusStyle = getStatusStyle(booking.status);

    return (
      <div key={booking.id} style={{
        background: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid #E5E7EB',
        transition: 'box-shadow 0.2s ease',
      }}>
        <div className="booking-card-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827', marginBottom: 4, letterSpacing: '-0.01em' }}>{booking.building}</h3>
            <p style={{ fontSize: 14, color: '#6B7280' }}>Unit {booking.unit_number} · {booking.floor_plan}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {freqName && freqName !== 'One-Time' && (
              <span style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#EEF2FF', color: '#111827' }}>
                {freqName}
              </span>
            )}
            <span style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, textTransform: 'capitalize', letterSpacing: '0.01em', ...statusStyle }}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="booking-details-row" style={{ padding: '16px 24px', background: '#F9FAFB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{formatDate(booking.booking_date)}</p>
            <p style={{ fontSize: 14, color: '#6B7280', marginTop: 2 }}>{booking.booking_time}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>${booking.total_price}</p>
            {booking.frequency_discount > 0 && (
              <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Savings: -${booking.frequency_discount}</p>
            )}
            {booking.add_ons && booking.add_ons.length > 0 && (
              <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>+{booking.add_ons.map(a => a.name).join(', ')}</p>
            )}
          </div>
        </div>

        <div className="booking-card-actions" style={{ padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(booking.status === 'upcoming' || booking.status === 'scheduled') && (
            <>
              <button onClick={() => openReschedule(booking)} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#6366F1', border: 'none', borderRadius: 8,
                cursor: 'pointer', color: '#fff', transition: 'opacity 0.2s',
              }}>Reschedule</button>
              <button onClick={async () => {
                if (confirm('Cancel this booking?')) {
                  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
                  setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
                }
              }} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
                cursor: 'pointer', color: '#DC2626', transition: 'all 0.2s',
              }}>Cancel</button>
            </>
          )}
          {(booking.status === 'completed' || booking.status === 'skipped' || booking.status === 'cancelled') && (
            <>
              <button onClick={() => handleBookAgain(booking)} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#6366F1', border: 'none', borderRadius: 8,
                cursor: 'pointer', color: '#fff', transition: 'opacity 0.2s',
              }}>Book Again</button>
              <button style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
                cursor: 'pointer', color: '#111827', transition: 'all 0.2s',
              }}>View Receipt</button>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header className="dashboard-header" style={{
        padding: '14px 24px',
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>BetterView</span>
        </Link>
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/book" style={{
            padding: '10px 24px', fontSize: 14, fontWeight: 600,
            background: '#6366F1', borderRadius: 100, color: '#fff', textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}>
            Book a Cleaning
          </Link>
          <div style={{ position: 'relative' }}>
            <div onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={{
              width: 36, height: 36, background: '#6366F1', borderRadius: '50%',
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
                  background: '#fff', borderRadius: 12,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                  minWidth: 200, zIndex: 100, overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease',
                }}>
                  <Link href="/dashboard/settings" onClick={() => setProfileMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px',
                    fontSize: 15, fontWeight: 500, color: '#111827', textDecoration: 'none',
                    borderBottom: '1px solid #E5E7EB', transition: 'background 0.15s',
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
            background: '#6366F1', border: 'none', borderRadius: 12,
            color: '#fff', textDecoration: 'none', textAlign: 'center'
          }}>
            Book a Cleaning
          </Link>
          <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '16px', fontSize: 16, fontWeight: 500,
            background: '#EEF2FF', border: 'none', borderRadius: 12,
            color: '#111827', textDecoration: 'none', textAlign: 'center'
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

      <main className="dashboard-main" style={{ maxWidth: 700, margin: '0 auto', padding: '48px 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#111827', marginBottom: 8, letterSpacing: '-0.02em' }}>My Bookings</h1>
        <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32 }}>Manage your upcoming and past cleanings</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: '#F3F4F6', borderRadius: 10, padding: 4 }}>
          <button onClick={() => setActiveTab('upcoming')} style={{
            flex: 1, padding: '12px 20px', fontSize: 14, fontWeight: 600,
            background: activeTab === 'upcoming' ? '#6366F1' : 'transparent',
            color: activeTab === 'upcoming' ? '#fff' : '#6B7280',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            Upcoming ({upcomingBookings.length})
          </button>
          <button onClick={() => setActiveTab('past')} style={{
            flex: 1, padding: '12px 20px', fontSize: 14, fontWeight: 600,
            background: activeTab === 'past' ? '#6366F1' : 'transparent',
            color: activeTab === 'past' ? '#fff' : '#6B7280',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            Past ({pastBookings.length})
          </button>
        </div>

        {activeTab === 'past' && cancelledSkippedCount > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#6B7280', cursor: 'pointer' }}>
              <input type="checkbox" checked={showCancelledSkipped} onChange={(e) => setShowCancelledSkipped(e.target.checked)} style={{ cursor: 'pointer', width: 18, height: 18, accentColor: '#6366F1' }} />
              Show cancelled &amp; skipped ({cancelledSkippedCount})
            </label>
          </div>
        )}

        {displayedBookings.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#F9FAFB', borderRadius: 16, border: '2px dashed #E5E7EB',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {activeTab === 'upcoming' ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              )}
            </div>
            <p style={{ color: '#6B7280', marginBottom: 24, fontSize: 16, fontWeight: 500 }}>
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
            {activeTab === 'upcoming' && (
              <Link href="/book" style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 600,
                background: '#6366F1', border: 'none', borderRadius: 8,
                color: '#fff', textDecoration: 'none', display: 'inline-block',
              }}>
                Book a Cleaning
              </Link>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Recurring groups */}
            {Object.entries(groups).map(([groupId, groupBookings]) => (
              <div key={groupId} style={{ border: '2px solid #6366F1', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '12px 24px', background: '#6366F1', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14 }}>&#x21BB;</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>
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
        <div onClick={(e) => { if (e.target === e.currentTarget) setRescheduleBooking(null); }} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{
            background: '#fff', borderRadius: 24, maxWidth: 440, width: '100%',
            padding: 0, position: 'relative', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
            animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Modal header */}
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #E5E7EB' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 4, letterSpacing: '-0.02em' }}>Reschedule</h2>
                  <p style={{ fontSize: 14, color: '#6B7280' }}>
                    {rescheduleBooking.building} · Unit {rescheduleBooking.unit_number}
                  </p>
                </div>
                <button onClick={() => setRescheduleBooking(null)} style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#F3F4F6',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div style={{ padding: '24px 28px' }}>
              {/* Current schedule */}
              <div style={{ background: '#F9FAFB', borderRadius: 14, padding: '16px 20px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Current</p>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>{formatDate(rescheduleBooking.booking_date)}</p>
                  <p style={{ fontSize: 14, color: '#6B7280' }}>{rescheduleBooking.booking_time}</p>
                </div>
              </div>

              {/* New Date */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={today}
                  style={{
                    width: '100%', padding: '16px 18px', fontSize: 15,
                    border: '1.5px solid #e5e5e5', borderRadius: 14,
                    boxSizing: 'border-box', background: '#fff',
                    outline: 'none', transition: 'border-color 0.2s',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e5e5'}
                />
              </div>

              {/* New Time */}
              <div style={{ marginBottom: 28 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#111827', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>New Time</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {timeSlots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setRescheduleTime(slot)}
                      style={{
                        padding: '14px 10px', fontSize: 13, fontWeight: 600,
                        border: rescheduleTime === slot ? '2px solid #6366F1' : '1px solid #E5E7EB',
                        borderRadius: 14, cursor: 'pointer',
                        background: rescheduleTime === slot ? '#6366F1' : '#fff',
                        color: rescheduleTime === slot ? '#fff' : '#111827',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      }}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {rescheduleError && (
                <div style={{
                  padding: '12px 16px', background: '#FEE2E2', borderRadius: 12,
                  marginBottom: 20, fontSize: 14, color: '#DC2626', fontWeight: 500,
                }}>
                  {rescheduleError}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 10 }}>
              <button
                onClick={() => setRescheduleBooking(null)}
                style={{
                  flex: 1, padding: '16px', fontSize: 15, fontWeight: 600,
                  background: '#F3F4F6', border: 'none', borderRadius: 14,
                  cursor: 'pointer', color: '#111827', transition: 'background 0.15s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                style={{
                  flex: 1, padding: '16px', fontSize: 15, fontWeight: 600,
                  background: rescheduleDate && rescheduleTime && !rescheduling ? '#6366F1' : '#e5e5e5',
                  color: rescheduleDate && rescheduleTime && !rescheduling ? '#fff' : '#999',
                  border: 'none', borderRadius: 14,
                  cursor: rescheduleDate && rescheduleTime && !rescheduling ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease',
                }}
              >
                {rescheduling ? 'Updating...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
