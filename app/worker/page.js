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

export default function WorkerDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [worker, setWorker] = useState(null);
  const [frequencies, setFrequencies] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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
      const [bkRes, fqRes] = await Promise.all([
        supabase.from('bookings').select('*').eq('worker_id', workerData.id).order('booking_date', { ascending: true }).limit(10000),
        supabase.from('frequencies').select('*').order('sort_order'),
      ]);
      setBookings(bkRes.data || []);
      setFrequencies(fqRes.data || []);
    }
    setDataLoading(false);
  };

  const getFrequencyName = (frequencyId) => {
    return frequencies.find(f => f.id === frequencyId)?.name || '';
  };

  const handleMarkComplete = async (bookingId) => {
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b));
  };

  const handleLogout = async () => { await signOut(); router.push('/worker/login'); };

  const upcomingBookings = bookings.filter(b => b.status === 'upcoming' || b.status === 'scheduled');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : completedBookings;

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'upcoming': return { background: '#DBEAFE', color: '#1E40AF' };
      case 'scheduled': return { background: '#EEF2FF', color: '#4338CA' };
      case 'completed': return { background: '#D1FAE5', color: '#065F46' };
      default: return { background: '#F3F4F6', color: '#6B7280' };
    }
  };

  // Group upcoming bookings by date
  const groupedByDate = {};
  displayedBookings.forEach(b => {
    if (!groupedByDate[b.booking_date]) groupedByDate[b.booking_date] = [];
    groupedByDate[b.booking_date].push(b);
  });
  const sortedDates = Object.keys(groupedByDate).sort();

  if (authLoading || dataLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff', fontFamily: font }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #6366F1',
          borderRadius: '50%', animation: 'workerSpin 0.8s linear infinite'
        }} />
        <p style={{ color: '#6B7280', fontSize: 14, marginTop: 16, fontWeight: 500 }}>Loading...</p>
        <style>{`@keyframes workerSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!worker) {
    return (
      <div style={{ minHeight: '100vh', background: '#fff', fontFamily: font }}>
        <header style={{
          padding: '16px 32px', background: '#fff', borderBottom: '1px solid #E5E7EB',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo />
            <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>BetterView</span>
          </div>
          <button onClick={handleLogout} style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 600,
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
            cursor: 'pointer', color: '#111827', transition: 'all 150ms ease'
          }}>Log Out</button>
        </header>
        <div style={{ maxWidth: 500, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, background: '#EEF2FF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', marginBottom: 12 }}>Worker Access Required</h1>
          <p style={{ color: '#6B7280', fontSize: 15, lineHeight: 1.6 }}>No worker profile is linked to <strong style={{ color: '#111827' }}>{user?.email}</strong>. Ask your admin to add your email to the workers list.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: font }}>
      <header className="worker-header" style={{
        padding: '14px 24px', background: '#fff', borderBottom: '1px solid #E5E7EB',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>BetterView</span>
          <span style={{
            marginLeft: 8, padding: '3px 8px',
            background: '#6366F1', color: '#fff',
            borderRadius: 6, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em'
          }}>WORKER</span>
        </div>
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#6B7280', fontWeight: 500 }}>{worker.name}</span>
          <button onClick={handleLogout} style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 600,
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
            cursor: 'pointer', color: '#111827', transition: 'all 150ms ease'
          }}>Log Out</button>
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
          <span style={{ padding: '14px 16px', fontSize: 15, color: '#6B7280', textAlign: 'center', fontWeight: 500 }}>{worker.name}</span>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{
            padding: '14px 16px', fontSize: 15, fontWeight: 600,
            background: '#6366F1', border: 'none', borderRadius: 10,
            color: '#fff', cursor: 'pointer'
          }}>
            Log Out
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
        {/* Stats Cards */}
        <div className="worker-card-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', lineHeight: 1 }}>{upcomingBookings.length}</p>
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Upcoming</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', lineHeight: 1 }}>{completedBookings.length}</p>
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Completed</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, textAlign: 'center', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: 32, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', lineHeight: 1 }}>
              ${completedBookings.reduce((sum, b) => sum + (b.total_price || 0), 0)}
            </p>
            <p style={{ fontSize: 12, color: '#6B7280', marginTop: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</p>
          </div>
        </div>

        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em', marginBottom: 20 }}>My Jobs</h1>

        {/* Tabs */}
        <div style={{
          display: 'inline-flex', background: '#F3F4F6', borderRadius: 10, padding: 3, marginBottom: 24
        }}>
          <button onClick={() => setActiveTab('upcoming')} style={{
            padding: '8px 18px', fontSize: 13, fontWeight: 600,
            background: activeTab === 'upcoming' ? '#6366F1' : 'transparent',
            color: activeTab === 'upcoming' ? '#fff' : '#6B7280',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            transition: 'all 150ms ease'
          }}>
            Upcoming ({upcomingBookings.length})
          </button>
          <button onClick={() => setActiveTab('completed')} style={{
            padding: '8px 18px', fontSize: 13, fontWeight: 600,
            background: activeTab === 'completed' ? '#6366F1' : 'transparent',
            color: activeTab === 'completed' ? '#fff' : '#6B7280',
            border: 'none', borderRadius: 8, cursor: 'pointer',
            transition: 'all 150ms ease'
          }}>
            Completed ({completedBookings.length})
          </button>
        </div>

        {/* Bookings grouped by date */}
        {sortedDates.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px', background: '#F9FAFB',
            borderRadius: 16, border: '2px dashed #E5E7EB'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <p style={{ color: '#6B7280', fontSize: 15, fontWeight: 500 }}>
              {activeTab === 'upcoming' ? 'No upcoming jobs assigned to you' : 'No completed jobs yet'}
            </p>
          </div>
        ) : (
          sortedDates.map(dateKey => (
            <div key={dateKey} style={{ marginBottom: 28 }}>
              <h3 style={{
                fontSize: 11, fontWeight: 600, color: '#9CA3AF',
                textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10
              }}>
                {formatDate(dateKey)}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {groupedByDate[dateKey].map(booking => {
                  const freqName = getFrequencyName(booking.frequency_id);
                  const statusStyle = getStatusStyle(booking.status);

                  return (
                    <div key={booking.id} style={{
                      background: '#fff', borderRadius: 12,
                      border: '1px solid #E5E7EB', overflow: 'hidden',
                      transition: 'box-shadow 150ms ease'
                    }}>
                      <div className="worker-booking-row" style={{
                        padding: '16px 18px', display: 'flex',
                        justifyContent: 'space-between', alignItems: 'center',
                        flexWrap: 'wrap', gap: 10
                      }}>
                        <div>
                          <h4 style={{ fontSize: 15, fontWeight: 600, color: '#111827', marginBottom: 3, letterSpacing: '-0.01em' }}>
                            {booking.building} - Unit {booking.unit_number}
                          </h4>
                          <p style={{ fontSize: 13, color: '#6B7280', fontWeight: 400 }}>{booking.booking_time} · {booking.floor_plan}</p>
                          {booking.add_ons && booking.add_ons.length > 0 && (
                            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                              {booking.add_ons.map((a, i) => (
                                <span key={i} style={{
                                  fontSize: 11, fontWeight: 600, color: '#4338CA',
                                  background: '#EEF2FF', padding: '3px 8px', borderRadius: 6
                                }}>
                                  {a.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="worker-booking-actions" style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 16, fontWeight: 700, color: '#111827', letterSpacing: '-0.01em' }}>${booking.total_price}</span>
                          {(booking.status === 'upcoming' || booking.status === 'scheduled') && (
                            <button onClick={() => handleMarkComplete(booking.id)} style={{
                              padding: '8px 16px', fontSize: 13, fontWeight: 600,
                              background: '#6366F1', color: '#fff',
                              border: 'none', borderRadius: 8, cursor: 'pointer',
                              transition: 'all 150ms ease'
                            }}>
                              Mark Done
                            </button>
                          )}
                          {booking.status === 'completed' && (
                            <span style={{
                              padding: '6px 14px', borderRadius: 100,
                              fontSize: 12, fontWeight: 600, ...statusStyle
                            }}>
                              Done
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{
                        padding: '10px 18px', background: '#F9FAFB',
                        borderTop: '1px solid #E5E7EB',
                        fontSize: 13, color: '#6B7280', fontWeight: 400
                      }}>
                        Customer: {booking.customer_name} · {booking.neighborhood}
                        {freqName && freqName !== 'One-Time' && (
                          <span style={{
                            marginLeft: 10, padding: '2px 8px', borderRadius: 6,
                            background: '#EEF2FF', color: '#4338CA', fontWeight: 600, fontSize: 11
                          }}>
                            {freqName}
                          </span>
                        )}
                        {booking.status === 'scheduled' && (
                          <span style={{
                            marginLeft: 8, padding: '2px 8px', borderRadius: 6,
                            background: '#EEF2FF', color: '#4338CA', fontWeight: 600, fontSize: 11
                          }}>
                            scheduled
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
