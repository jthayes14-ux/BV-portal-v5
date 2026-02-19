'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
    </div>
  );
}

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function AdminCalendar() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa', white: '#ffffff',
    success: '#22c55e', gold: '#C9B037',
  };

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user && !ADMIN_EMAILS.includes(user.email?.toLowerCase())) { router.push('/dashboard'); return; }
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  const expandRecurringBookings = (rawBookings) => {
    const expanded = [];
    const horizon = new Date();
    horizon.setFullYear(horizon.getFullYear() + 1);

    for (const booking of rawBookings) {
      expanded.push(booking);

      if (!booking.recurrence || booking.recurrence === 'one-time') continue;

      const start = new Date(booking.booking_date + 'T00:00:00');
      let next = new Date(start);

      while (true) {
        if (booking.recurrence === 'weekly') {
          next = new Date(next);
          next.setDate(next.getDate() + 7);
        } else if (booking.recurrence === 'biweekly') {
          next = new Date(next);
          next.setDate(next.getDate() + 14);
        } else if (booking.recurrence === 'monthly') {
          next = new Date(next);
          next.setMonth(next.getMonth() + 1);
        } else {
          break;
        }

        if (next > horizon) break;

        const y = next.getFullYear();
        const m = String(next.getMonth() + 1).padStart(2, '0');
        const d = String(next.getDate()).padStart(2, '0');

        expanded.push({
          ...booking,
          booking_date: `${y}-${m}-${d}`,
          _isRecurringInstance: true,
          _originalDate: booking.booking_date,
          status: next > new Date() ? 'upcoming' : booking.status,
        });
      }
    }

    return expanded;
  };

  const loadData = async () => {
    const [bkRes, wRes] = await Promise.all([
      supabase.from('bookings').select('*').order('booking_date'),
      supabase.from('workers').select('*').order('name'),
    ]);
    setBookings(expandRecurringBookings(bkRes.data || []));
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

  const getBookingsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.booking_date === dateStr);
  };

  const getWorkerName = (workerId) => {
    return workers.find(w => w.id === workerId)?.name || 'Unassigned';
  };

  const dayBookings = selectedDay ? getBookingsForDay(selectedDay) : [];

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (authLoading || dataLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}><p style={{ color: brand.textLight }}>Loading...</p></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      <header className="admin-header calendar-header" style={{ padding: '16px 32px', background: brand.white, borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
          <span style={{ marginLeft: 12, padding: '4px 10px', background: brand.text, color: brand.white, borderRadius: 4, fontSize: 12, fontWeight: 600 }}>CALENDAR</span>
        </div>
        <Link href="/admin" style={{ fontSize: 14, color: brand.text, textDecoration: 'none', padding: '8px 16px', border: `1px solid ${brand.border}`, borderRadius: 6, fontWeight: 500 }}>
          Back to Admin
        </Link>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        {/* Month Navigation */}
        <div className="calendar-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <button onClick={prevMonth} style={{ padding: '10px 20px', fontSize: 14, background: brand.white, border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: brand.text }}>
            Previous
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: brand.text }}>{monthName}</h1>
          <button onClick={nextMonth} style={{ padding: '10px 20px', fontSize: 14, background: brand.white, border: `1px solid ${brand.border}`, borderRadius: 6, cursor: 'pointer', color: brand.text }}>
            Next
          </button>
        </div>

        {/* Calendar Grid */}
        <div style={{ background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
          {/* Day Headers */}
          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: `1px solid ${brand.border}` }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: brand.textLight, background: brand.bg }}>
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="calendar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {/* Empty cells for days before the first */}
            {Array.from({ length: firstDay }, (_, i) => (
              <div key={`empty-${i}`} style={{ minHeight: 100, padding: 8, borderRight: `1px solid ${brand.border}`, borderBottom: `1px solid ${brand.border}`, background: brand.bg }} />
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
                    borderRight: `1px solid ${brand.border}`,
                    borderBottom: `1px solid ${brand.border}`,
                    background: isSelected ? brand.primary + '20' : isToday ? '#FFFBEB' : brand.white,
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: isToday ? 700 : 500, color: isToday ? brand.gold : brand.text, marginBottom: 4 }}>
                    {day}
                  </div>
                  {dayBk.slice(0, 3).map((bk, idx) => (
                    <div key={idx} className="calendar-booking-pill" style={{
                      padding: '2px 6px', marginBottom: 2, borderRadius: 4, fontSize: 11,
                      background: bk.status === 'upcoming' ? brand.primary : '#e8e8e8',
                      color: brand.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      {(bk._isRecurringInstance || (bk.recurrence && bk.recurrence !== 'one-time')) && (
                        <span style={{ fontSize: 10, flexShrink: 0 }} title={bk.recurrence}>&#x21BB;</span>
                      )}
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{bk.building} - {bk.unit_number}</span>
                    </div>
                  ))}
                  {dayBk.length > 3 && (
                    <div style={{ fontSize: 11, color: brand.textLight, padding: '2px 6px' }}>
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
          <div style={{ marginTop: 32, background: brand.white, borderRadius: 12, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', background: brand.bg, borderBottom: `1px solid ${brand.border}` }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: brand.text }}>
                {formatDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)}
              </h2>
              <p style={{ fontSize: 14, color: brand.textLight }}>{dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}</p>
            </div>
            {dayBookings.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center', color: brand.textLight }}>
                No bookings on this day
              </div>
            ) : (
              <div>
                {dayBookings.map((booking, idx) => (
                  <div key={`${booking.id}-${idx}`} className="calendar-detail-row" style={{ padding: '16px 24px', borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <p style={{ fontWeight: 600, color: brand.text }}>{booking.building} - Unit {booking.unit_number}</p>
                      <p style={{ fontSize: 13, color: brand.textLight }}>{booking.booking_time} · {booking.customer_name}</p>
                      {booking.recurrence && booking.recurrence !== 'one-time' && (
                        <p style={{ fontSize: 12, color: brand.gold, marginTop: 2 }}>
                          &#x21BB; {booking.recurrence.charAt(0).toUpperCase() + booking.recurrence.slice(1)} recurring
                          {booking._isRecurringInstance && (
                            <span style={{ color: brand.textLight }}> (originally {formatDate(booking._originalDate)})</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="calendar-detail-meta" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 13, color: brand.textLight }}>
                        Worker: <strong>{getWorkerName(booking.worker_id)}</strong>
                      </span>
                      {booking.recurrence && booking.recurrence !== 'one-time' && (
                        <span style={{
                          padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                          background: '#F5F0DC', color: '#A69028'
                        }}>
                          {booking.recurrence}
                        </span>
                      )}
                      <span style={{
                        padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                        background: booking.status === 'upcoming' ? brand.primary : '#e8e8e8', color: brand.text
                      }}>
                        {booking.status}
                      </span>
                      <span style={{ fontWeight: 600, color: brand.text }}>${booking.total_price}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
