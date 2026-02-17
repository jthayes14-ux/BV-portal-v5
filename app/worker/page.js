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

export default function WorkerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [worker, setWorker] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa', white: '#ffffff',
    success: '#22c55e', gold: '#C9B037',
  };

  useEffect(() => {
    if (!authLoading && !user) { router.push('/worker/login'); return; }
    if (!authLoading && user) loadWorkerData();
  }, [authLoading, user]);

  const loadWorkerData = async () => {
    // Find worker by email match
    const { data: workerData } = await supabase
      .from('workers')
      .select('*')
      .eq('email', user.email)
      .single();

    if (workerData) {
      setWorker(workerData);
      const { data: bkData } = await supabase
        .from('bookings')
        .select('*')
        .eq('worker_id', workerData.id)
        .order('booking_date', { ascending: true });
      setBookings(bkData || []);
    }
    setDataLoading(false);
  };

  const handleMarkComplete = async (bookingId) => {
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b));
  };

  const handleLogout = async () => { await signOut(); router.push('/worker/login'); };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : completedBookings;

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  // Group upcoming bookings by date
  const groupedByDate = {};
  displayedBookings.forEach(b => {
    if (!groupedByDate[b.booking_date]) groupedByDate[b.booking_date] = [];
    groupedByDate[b.booking_date].push(b);
  });
  const sortedDates = Object.keys(groupedByDate).sort();

  if (authLoading || dataLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}><p style={{ color: brand.textLight }}>Loading...</p></div>;
  }

  if (!worker) {
    return (
      <div style={{ minHeight: '100vh', background: brand.bg }}>
        <header style={{ padding: '16px 32px', background: brand.white, borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo />
            <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
          </div>
          <button onClick={handleLogout} style={{ padding: '8px 16px', fontSize: 14, background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: brand.text }}>Log Out</button>
        </header>
        <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text, marginBottom: 12 }}>Worker Access Required</h1>
          <p style={{ color: brand.textLight }}>No worker profile is linked to <strong>{user?.email}</strong>. Ask your admin to add your email to the workers list.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      <header style={{ padding: '16px 32px', background: brand.white, borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
          <span style={{ marginLeft: 12, padding: '4px 10px', background: brand.gold, color: brand.white, borderRadius: 4, fontSize: 12, fontWeight: 600 }}>WORKER</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: brand.textLight }}>{worker.name}</span>
          <button onClick={handleLogout} style={{ padding: '8px 16px', fontSize: 14, background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: brand.text }}>Log Out</button>
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Cards */}
        <div className="worker-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
          <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: brand.text }}>{upcomingBookings.length}</p>
            <p style={{ fontSize: 14, color: brand.textLight }}>Upcoming Jobs</p>
          </div>
          <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: brand.text }}>{completedBookings.length}</p>
            <p style={{ fontSize: 14, color: brand.textLight }}>Completed</p>
          </div>
          <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, padding: 20, textAlign: 'center' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: brand.success }}>
              ${completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)}
            </p>
            <p style={{ fontSize: 14, color: brand.textLight }}>Total Revenue</p>
          </div>
        </div>

        <h1 style={{ fontSize: 28, fontWeight: 600, color: brand.text, marginBottom: 24 }}>My Jobs</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `1px solid ${brand.border}` }}>
          <button onClick={() => setActiveTab('upcoming')} style={{ padding: '12px 24px', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', borderBottom: activeTab === 'upcoming' ? `2px solid ${brand.text}` : '2px solid transparent', color: activeTab === 'upcoming' ? brand.text : brand.textLight, cursor: 'pointer', marginBottom: -1 }}>
            Upcoming ({upcomingBookings.length})
          </button>
          <button onClick={() => setActiveTab('completed')} style={{ padding: '12px 24px', fontSize: 15, fontWeight: 500, background: 'none', border: 'none', borderBottom: activeTab === 'completed' ? `2px solid ${brand.text}` : '2px solid transparent', color: activeTab === 'completed' ? brand.text : brand.textLight, cursor: 'pointer', marginBottom: -1 }}>
            Completed ({completedBookings.length})
          </button>
        </div>

        {/* Bookings grouped by date */}
        {sortedDates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}` }}>
            <p style={{ color: brand.textLight }}>
              {activeTab === 'upcoming' ? 'No upcoming jobs assigned to you' : 'No completed jobs yet'}
            </p>
          </div>
        ) : (
          sortedDates.map(dateKey => (
            <div key={dateKey} style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: brand.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
                {formatDate(dateKey)}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {groupedByDate[dateKey].map(booking => (
                  <div key={booking.id} style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                      <div>
                        <h4 style={{ fontSize: 16, fontWeight: 600, color: brand.text, marginBottom: 4 }}>
                          {booking.building} - Unit {booking.unit_number}
                        </h4>
                        <p style={{ fontSize: 14, color: brand.textLight }}>{booking.booking_time} · {booking.floor_plan}</p>
                        {booking.add_ons && booking.add_ons.length > 0 && (
                          <p style={{ fontSize: 13, color: brand.gold, marginTop: 4 }}>
                            Add-Ons: {booking.add_ons.map(a => a.name).join(', ')}
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>${booking.total_price}</span>
                        {booking.status === 'upcoming' && (
                          <button onClick={() => handleMarkComplete(booking.id)} style={{
                            padding: '8px 16px', fontSize: 13, fontWeight: 600,
                            background: brand.success, color: brand.white,
                            border: 'none', borderRadius: 6, cursor: 'pointer'
                          }}>
                            Mark Done
                          </button>
                        )}
                        {booking.status === 'completed' && (
                          <span style={{ padding: '6px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#e8e8e8', color: brand.text }}>
                            Done
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ padding: '10px 20px', background: brand.bg, borderTop: `1px solid ${brand.border}`, fontSize: 13, color: brand.textLight }}>
                      Customer: {booking.customer_name} · {booking.neighborhood}
                      {booking.recurrence && booking.recurrence !== 'one-time' && (
                        <span style={{ marginLeft: 12, padding: '2px 8px', borderRadius: 4, background: '#F5F0DC', color: '#A69028', fontWeight: 600 }}>
                          {booking.recurrence}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
