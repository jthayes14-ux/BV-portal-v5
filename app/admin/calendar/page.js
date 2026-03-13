'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      <div style={{ width: 4, height: 22, background: '#B8C5F2', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#B8C5F2', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#B8C5F2', borderRadius: 1 }} />
    </div>
  );
}

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function parseLocalDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function AdminCalendar() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [showCancelled, setShowCancelled] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user && !ADMIN_EMAILS.includes(user.email?.toLowerCase())) { router.push('/dashboard'); return; }
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  const getFrequencyById = (id) => frequencies.find(f => f.id === id);

  const loadData = async () => {
    const [bkRes, wRes, fqRes] = await Promise.all([
      supabase.from('bookings').select('*').order('booking_date').limit(10000),
      supabase.from('workers').select('*').order('name'),
      supabase.from('frequencies').select('*').order('sort_order'),
    ]);
    const freqData = fqRes.data || [];
    setFrequencies(freqData);
    setBookings(bkRes.data || []);
    setWorkers(wRes.data || []);
    setDataLoading(false);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = currentDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const visibleBookings = bookings.filter(b => {
    if (b.status === 'cancelled' && !showCancelled) return false;
    if (b.status === 'skipped' && !showSkipped) return false;
    return true;
  });

  const getBookingsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return visibleBookings.filter(b => b.booking_date === dateStr);
  };

  const getWorkerName = (workerId) => {
    return workers.find(w => w.id === workerId)?.name || 'Unassigned';
  };

  const dayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

  const formatDate = (dateStr) => {
    return parseLocalDate(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'upcoming': return { background: '#9AA8E0', color: '#fff' };
      case 'scheduled': return { background: '#E8EDFC', color: '#2D3748' };
      case 'completed': return { background: '#E8EDFC', color: '#718096' };
      case 'skipped': return { background: '#FEF3C7', color: '#92400E' };
      case 'cancelled': return { background: '#FEE2E2', color: '#DC2626' };
      default: return { background: '#E8EDFC', color: '#718096' };
    }
  };

  if (authLoading || dataLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #E8EDFC', borderTopColor: '#9AA8E0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#718096', fontSize: 15 }}>Loading...</p>
        </div>
        <style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#fff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <header className="admin-header calendar-header" style={{
        padding: '14px 24px', background: '#fff', borderBottom: '1px solid #E8EDFC',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#2D3748', letterSpacing: '-0.02em' }}>BetterView</span>
          <span style={{ marginLeft: 8, padding: '4px 10px', background: '#9AA8E0', color: '#fff', borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: '0.04em' }}>CALENDAR</span>
        </div>
        <Link href="/admin" style={{
          fontSize: 14, color: '#2D3748', textDecoration: 'none', padding: '8px 20px',
          background: '#EEF1FC', borderRadius: 100, fontWeight: 600, transition: 'background 0.15s'
        }}>
          Back to Admin
        </Link>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Month Navigation */}
        <div className="calendar-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <button onClick={prevMonth} style={{
            padding: '10px 24px', fontSize: 14, fontWeight: 600,
            background: '#EEF1FC', border: 'none', borderRadius: 100,
            cursor: 'pointer', color: '#2D3748', transition: 'background 0.15s'
          }}>
            Previous
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#2D3748', letterSpacing: '-0.02em' }}>{monthName}</h1>
          <button onClick={nextMonth} style={{
            padding: '10px 24px', fontSize: 14, fontWeight: 600,
            background: '#EEF1FC', border: 'none', borderRadius: 100,
            cursor: 'pointer', color: '#2D3748', transition: 'background 0.15s'
          }}>
            Next
          </button>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 20, alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#718096', cursor: 'pointer' }}>
            <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} style={{ cursor: 'pointer', width: 18, height: 18, accentColor: '#9AA8E0' }} />
            Show Cancelled
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: '#718096', cursor: 'pointer' }}>
            <input type="checkbox" checked={showSkipped} onChange={(e) => setShowSkipped(e.target.checked)} style={{ cursor: 'pointer', width: 18, height: 18, accentColor: '#9AA8E0' }} />
            Show Skipped
          </label>
        </div>

        {/* Calendar Grid */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #E8EDFC', overflow: 'hidden' }}>
          {/* Day Headers */}
          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid #E8EDFC' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{
                padding: '14px 8px', textAlign: 'center', fontSize: 13,
                fontWeight: 700, color: '#718096', background: '#F8FAFF',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells for days before the first */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: 100, padding: 8, borderRight: '1px solid #E8EDFC', borderBottom: '1px solid #E8EDFC', background: '#F8FAFF' }} />
            ))}

            {/* Day cells */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const dayBk = getBookingsForDay(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className="calendar-day-cell"
                  style={{
                    minHeight: 100, padding: 8, cursor: 'pointer',
                    borderRight: '1px solid #E8EDFC',
                    borderBottom: '1px solid #E8EDFC',
                    background: isSelected ? '#EEF1FC' : isToday ? '#F8FAFF' : '#fff',
                    transition: 'background 0.15s'
                  }}
                >
                  <div style={{
                    fontSize: 14, marginBottom: 4,
                    fontWeight: isToday ? 800 : 500,
                    color: isToday ? '#fff' : '#2D3748',
                    width: isToday ? 28 : 'auto', height: isToday ? 28 : 'auto',
                    background: isToday ? '#9AA8E0' : 'transparent',
                    borderRadius: isToday ? '50%' : 0,
                    display: isToday ? 'flex' : 'block',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {day}
                  </div>
                  {dayBk.slice(0, 3).map((bk, idx) => {
                    const isRecurring = !!bk.recurring_group_id;
                    return (
                      <div key={idx} className="calendar-booking-pill" style={{
                        padding: '2px 6px', marginBottom: 2, borderRadius: 6, fontSize: 11,
                        background: bk.status === 'upcoming' ? '#9AA8E0' : bk.status === 'scheduled' ? '#E8EDFC' : '#EEF1FC',
                        color: bk.status === 'upcoming' ? '#fff' : '#2D3748',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        display: 'flex', alignItems: 'center', gap: 3, fontWeight: 500,
                      }}>
                        {isRecurring && (
                          <span style={{ fontSize: 10, flexShrink: 0 }} title="Recurring">&#x21BB;</span>
                        )}
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{bk.building} - {bk.unit_number}</span>
                      </div>
                    );
                  })}
                  {dayBk.length > 3 && (
                    <div style={{ fontSize: 11, color: '#718096', padding: '2px 6px', fontWeight: 600 }}>
                      +{dayBk.length - 3} more
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Detail */}
        {selectedDay && (
          <div style={{ marginTop: 32, background: '#fff', borderRadius: 20, border: '1px solid #E8EDFC', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: '#F8FAFF', borderBottom: '1px solid #E8EDFC' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2D3748', letterSpacing: '-0.01em' }}>
                {formatDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)}
              </h2>
              <p style={{ fontSize: 14, color: '#718096', marginTop: 4 }}>{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}</p>
            </div>
            {dayBookings.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', color: '#718096', fontSize: 15 }}>
                No bookings on this day
              </div>
            ) : (
              <div>
                {dayBookings.map((booking, idx) => {
                  const freq = getFrequencyById(booking.frequency_id);
                  const freqName = freq?.name || '';
                  const isRecurring = !!booking.recurring_group_id;
                  const statusStyle = getStatusStyle(booking.status);

                  return (
                    <div key={`${booking.id}-${idx}`} className="calendar-detail-row" style={{ padding: '18px 24px', borderBottom: '1px solid #E8EDFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <p style={{ fontWeight: 700, color: '#2D3748', fontSize: 15, letterSpacing: '-0.01em' }}>{booking.building} - Unit {booking.unit_number}</p>
                        <p style={{ fontSize: 14, color: '#718096', marginTop: 2 }}>{booking.booking_time} · {booking.customer_name}</p>
                        {freqName && freqName !== 'One-Time' && (
                          <p style={{ fontSize: 12, color: '#2D3748', marginTop: 4, fontWeight: 600 }}>
                            &#x21BB; {freqName} frequency
                            {isRecurring && <span style={{ color: '#718096', fontWeight: 400 }}> (recurring series)</span>}
                          </p>
                        )}
                      </div>
                      <div className="calendar-detail-meta" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 13, color: '#718096' }}>
                          Worker: <strong style={{ color: '#2D3748' }}>{getWorkerName(booking.worker_id)}</strong>
                        </span>
                        {freqName && freqName !== 'One-Time' && (
                          <span style={{
                            padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                            background: '#EEF1FC', color: '#2D3748'
                          }}>
                            {freqName}
                          </span>
                        )}
                        <span style={{
                          padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                          ...statusStyle
                        }}>
                          {booking.status}
                        </span>
                        <span style={{ fontWeight: 700, color: '#2D3748', fontSize: 15 }}>${booking.total_price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
