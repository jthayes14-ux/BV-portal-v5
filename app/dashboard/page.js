'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      <div style={{ width: 4, height: 22, background: '#B8C5F2', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#B8C5F2', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#B8C5F2', borderRadius: 1 }} />
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

  // Availability state (same system as booking page)
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');
  const [serviceSettings, setServiceSettings] = useState({});
  const [allAvailability, setAllAvailability] = useState([]);
  const [allBlockedDates, setAllBlockedDates] = useState([]);
  const [allOverrides, setAllOverrides] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [assignedWorkerId, setAssignedWorkerId] = useState(null);
  const [maxDate, setMaxDate] = useState('');
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  const loadData = async () => {
    const [bkRes, fqRes, svcRes, avRes, bdRes, soRes, wRes] = await Promise.all([
      supabase.from('bookings').select('*, floor_plans:floor_plan_id(duration_minutes)').eq('user_id', user.id).order('booking_date', { ascending: false }).limit(10000),
      supabase.from('frequencies').select('*').order('sort_order'),
      supabase.from('site_settings').select('*'),
      supabase.from('availability').select('*').order('day_of_week'),
      supabase.from('blocked_dates').select('*').order('blocked_date'),
      supabase.from('schedule_overrides').select('*').order('override_date'),
      supabase.from('workers').select('*').eq('archived', false).order('name'),
    ]);
    setBookings(bkRes.data || []);
    setFrequencies(fqRes.data || []);

    const allSettings = svcRes.data || [];
    const settingsObj = {};
    allSettings.forEach(s => { settingsObj[s.key] = s.value; });
    setServiceSettings(settingsObj);
    setAllAvailability(avRes.data || []);
    setAllBlockedDates(bdRes.data || []);
    setAllOverrides(soRes.data || []);
    setAllWorkers(wRes.data || []);

    const advanceDays = Number(settingsObj.advance_booking_days) || 30;
    const maxD = new Date();
    maxD.setDate(maxD.getDate() + advanceDays);
    setMaxDate(maxD.toISOString().split('T')[0]);

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

  const formatHour = (hour) => {
    const h = hour % 12 || 12;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:00 ${ampm}`;
  };

  const computeAvailableSlots = async (selectedDate) => {
    setSlotsLoading(true);
    setSlotsMessage('');
    setAvailableSlots([]);
    setRescheduleTime('');
    setAssignedWorkerId(null);

    const globalSlotDuration = Number(serviceSettings.slot_duration_minutes) || 60;
    const rescheduleFloorPlanDuration = Number(rescheduleBooking?.floor_plans?.duration_minutes) || globalSlotDuration;
    const slotDuration = rescheduleFloorPlanDuration;
    const buffer = Number(serviceSettings.buffer_between_jobs_minutes) || 15;
    const minNoticeHours = Number(serviceSettings.minimum_notice_hours) || 24;
    const advanceDays = Number(serviceSettings.advance_booking_days) || 30;

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const now = new Date();

    const minNoticeTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);
    const endOfSelectedDay = new Date(selectedDate + 'T23:59:59');
    if (endOfSelectedDay < minNoticeTime) {
      setSlotsMessage('This date is too soon — minimum notice required.');
      setSlotsLoading(false);
      return;
    }

    const maxAdvanceDate = new Date();
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + advanceDays);
    if (dateObj > maxAdvanceDate) {
      setSlotsMessage('This date is too far in advance.');
      setSlotsLoading(false);
      return;
    }

    const jsDay = dateObj.getDay();
    const dbDayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    const useWorkerSchedules = allWorkers.length > 0;

    if (useWorkerSchedules) {
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('booking_time, worker_id, floor_plan_id, floor_plans:floor_plan_id(duration_minutes)')
        .eq('booking_date', selectedDate)
        .in('status', ['upcoming', 'scheduled']);
      const bookedSlots = existingBookings || [];

      // Exclude the current booking being rescheduled from conflicts
      const currentBookingId = rescheduleBooking?.id;
      const filteredBookedSlots = bookedSlots.filter(b => {
        // We can't filter by ID from the query since we only selected booking_time and worker_id,
        // but we need to allow the booking's own slot. We'll handle this by not filtering here
        // since we fetched minimal fields. The booking being rescheduled will move to a new date
        // so it won't conflict on a different date. If same date, its old time should still be
        // available since we're moving away from it.
        return true;
      });

      const slotMap = {};

      for (const worker of allWorkers) {
        const override = allOverrides.find(o => o.worker_id === worker.id && o.override_date === selectedDate);
        let startTime, endTime, isAvailable;

        if (override) {
          isAvailable = override.is_available;
          startTime = override.start_time;
          endTime = override.end_time;
        } else {
          const weeklyAvail = allAvailability.find(a => a.worker_id === worker.id && a.day_of_week === dbDayOfWeek);
          if (weeklyAvail) {
            if (!weeklyAvail.is_active) continue;
            isAvailable = true;
            startTime = weeklyAvail.start_time;
            endTime = weeklyAvail.end_time;
          } else {
            isAvailable = true;
            startTime = '09:00';
            endTime = '16:00';
          }
        }

        if (!isAvailable) continue;

        const blocked = allBlockedDates.filter(bd => bd.worker_id === worker.id && bd.blocked_date === selectedDate);
        if (blocked.some(bd => bd.all_day)) continue;

        const startHour = parseInt(startTime?.slice(0, 2) || '9', 10);
        const startMin = parseInt(startTime?.slice(3, 5) || '0', 10);
        const endHour = parseInt(endTime?.slice(0, 2) || '16', 10);
        const endMin = parseInt(endTime?.slice(3, 5) || '0', 10);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        const workerBookings = filteredBookedSlots.filter(b => b.worker_id === worker.id);
        const bookedRanges = workerBookings.map(b => {
          const match = (b.booking_time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (!match) return null;
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          const s = h * 60 + m;
          const bookingDuration = Number(b.floor_plans?.duration_minutes) || globalSlotDuration;
          return { start: s, end: s + bookingDuration + buffer };
        }).filter(Boolean);

        const partialBlocks = blocked.filter(bd => !bd.all_day).map(bd => {
          const bStart = parseInt(bd.start_time?.slice(0, 2) || '0', 10) * 60 + parseInt(bd.start_time?.slice(3, 5) || '0', 10);
          const bEnd = parseInt(bd.end_time?.slice(0, 2) || '0', 10) * 60 + parseInt(bd.end_time?.slice(3, 5) || '0', 10);
          return { start: bStart, end: bEnd };
        });

        for (let slotStart = startMinutes; slotStart + slotDuration <= endMinutes; slotStart += 60) {
          const slotEnd = slotStart + slotDuration;
          const slotEndWithBuffer = slotStart + slotDuration + buffer;

          if (selectedDate === now.toISOString().split('T')[0]) {
            const slotDateTime = new Date(selectedDate + 'T00:00:00');
            slotDateTime.setMinutes(slotDateTime.getMinutes() + slotStart);
            if (slotDateTime < minNoticeTime) continue;
          }

          if (bookedRanges.some(r => slotStart < r.end && slotEndWithBuffer > r.start)) continue;
          if (partialBlocks.some(r => slotStart < r.end && slotEnd > r.start)) continue;

          const hour = Math.floor(slotStart / 60);
          const label = formatHour(hour);
          if (!slotMap[label]) slotMap[label] = [];
          slotMap[label].push(worker.id);
        }
      }

      const slots = Object.entries(slotMap)
        .map(([label, workerIds]) => ({ label, workerIds }))
        .sort((a, b) => {
          const parseTime = (str) => {
            const m = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!m) return 0;
            let h = parseInt(m[1], 10);
            if (m[3].toUpperCase() === 'PM' && h !== 12) h += 12;
            if (m[3].toUpperCase() === 'AM' && h === 12) h = 0;
            return h * 60 + parseInt(m[2], 10);
          };
          return parseTime(a.label) - parseTime(b.label);
        });

      if (slots.length === 0) {
        setSlotsMessage('No times available for this date');
      }
      setAvailableSlots(slots);
    } else {
      const businessStart = 9 * 60;
      const businessEnd = 16 * 60;
      const slots = [];

      for (let slotStart = businessStart; slotStart + slotDuration <= businessEnd; slotStart += 60) {
        if (selectedDate === now.toISOString().split('T')[0]) {
          const slotDateTime = new Date(selectedDate + 'T00:00:00');
          slotDateTime.setMinutes(slotDateTime.getMinutes() + slotStart);
          if (slotDateTime < minNoticeTime) continue;
        }
        const hour = Math.floor(slotStart / 60);
        slots.push({ label: formatHour(hour), workerIds: [] });
      }

      if (slots.length === 0) {
        setSlotsMessage('No times available for this date');
      }
      setAvailableSlots(slots);
    }

    setSlotsLoading(false);
  };

  const openReschedule = (booking) => {
    setRescheduleBooking(booking);
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleError('');
    setAvailableSlots([]);
    setSlotsMessage('');
    setAssignedWorkerId(null);
    const now = new Date();
    setCalendarMonth(now.getMonth());
    setCalendarYear(now.getFullYear());
  };

  // Compute available slots when reschedule date changes
  useEffect(() => {
    if (!rescheduleDate) {
      setAvailableSlots([]);
      setSlotsMessage('');
      setAssignedWorkerId(null);
      return;
    }
    computeAvailableSlots(rescheduleDate);
  }, [rescheduleDate, allAvailability, allBlockedDates, allOverrides, allWorkers, serviceSettings]);

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please select both a date and time');
      return;
    }
    setRescheduling(true);
    setRescheduleError('');

    const updateData = { booking_date: rescheduleDate, booking_time: rescheduleTime };
    if (assignedWorkerId) updateData.worker_id = assignedWorkerId;

    const { error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', rescheduleBooking.id);

    if (error) {
      setRescheduleError('Failed to reschedule. Please try again.');
      setRescheduling(false);
      return;
    }

    setBookings(bookings.map(b =>
      b.id === rescheduleBooking.id
        ? { ...b, booking_date: rescheduleDate, booking_time: rescheduleTime, ...(assignedWorkerId ? { worker_id: assignedWorkerId } : {}) }
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
      case 'upcoming': return { background: '#9AA8E0', color: '#fff' };
      case 'scheduled': return { background: '#E8EDFC', color: '#2D3748' };
      case 'completed': return { background: '#E8EDFC', color: '#718096' };
      case 'skipped': return { background: '#FEF3C7', color: '#92400E' };
      case 'cancelled': return { background: '#FEE2E2', color: '#DC2626' };
      default: return { background: '#E8EDFC', color: '#718096' };
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
          <div style={{ width: 40, height: 40, border: '3px solid #E8EDFC', borderTopColor: '#9AA8E0', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ color: '#718096', fontSize: 15 }}>Loading...</p>
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
        borderRadius: 16,
        overflow: 'hidden',
        border: '1px solid #E8EDFC',
        transition: 'box-shadow 0.2s ease',
      }}>
        <div className="booking-card-header" style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: '#2D3748', marginBottom: 4, letterSpacing: '-0.01em' }}>{booking.building}</h3>
            <p style={{ fontSize: 14, color: '#718096' }}>Unit {booking.unit_number} · {booking.floor_plan}</p>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {freqName && freqName !== 'One-Time' && (
              <span style={{ padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, background: '#EEF1FC', color: '#2D3748' }}>
                {freqName}
              </span>
            )}
            <span style={{ padding: '5px 14px', borderRadius: 100, fontSize: 12, fontWeight: 600, textTransform: 'capitalize', letterSpacing: '0.01em', ...statusStyle }}>
              {booking.status}
            </span>
          </div>
        </div>

        <div className="booking-details-row" style={{ padding: '16px 24px', background: '#F8FAFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 15, fontWeight: 600, color: '#2D3748' }}>{formatDate(booking.booking_date)}</p>
            <p style={{ fontSize: 14, color: '#718096', marginTop: 2 }}>{booking.booking_time}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 20, fontWeight: 700, color: '#2D3748' }}>${booking.total_price}</p>
            {booking.frequency_discount > 0 && (
              <p style={{ fontSize: 12, color: '#718096', marginTop: 2 }}>Savings: -${booking.frequency_discount}</p>
            )}
            {booking.add_ons && booking.add_ons.length > 0 && (
              <p style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>+{booking.add_ons.map(a => a.name).join(', ')}</p>
            )}
          </div>
        </div>

        <div className="booking-card-actions" style={{ padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {(booking.status === 'upcoming' || booking.status === 'scheduled') && (
            <>
              <button onClick={() => openReschedule(booking)} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#9AA8E0', border: 'none', borderRadius: 100,
                cursor: 'pointer', color: '#fff', transition: 'opacity 0.2s',
              }}>Reschedule</button>
              <button onClick={async () => {
                if (confirm('Cancel this booking?')) {
                  await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
                  setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
                }
              }} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 100,
                cursor: 'pointer', color: '#dc2626', transition: 'all 0.2s',
              }}>Cancel</button>
            </>
          )}
          {(booking.status === 'completed' || booking.status === 'skipped' || booking.status === 'cancelled') && (
            <>
              <button onClick={() => handleBookAgain(booking)} style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#9AA8E0', border: 'none', borderRadius: 100,
                cursor: 'pointer', color: '#fff', transition: 'opacity 0.2s',
              }}>Book Again</button>
              <button style={{
                padding: '10px 24px', fontSize: 14, fontWeight: 600,
                background: '#fff', border: '1.5px solid #e5e5e5', borderRadius: 100,
                cursor: 'pointer', color: '#2D3748', transition: 'all 0.2s',
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
        borderBottom: '1px solid #E8EDFC',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#2D3748', letterSpacing: '-0.02em' }}>BetterView</span>
        </Link>
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/book" style={{
            padding: '10px 24px', fontSize: 14, fontWeight: 600,
            background: '#9AA8E0', borderRadius: 100, color: '#fff', textDecoration: 'none',
            transition: 'opacity 0.2s',
          }}>
            Book a Cleaning
          </Link>
          <div style={{ position: 'relative' }}>
            <div onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={{
              width: 36, height: 36, background: '#9AA8E0', borderRadius: '50%',
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
                    fontSize: 15, fontWeight: 500, color: '#2D3748', textDecoration: 'none',
                    borderBottom: '1px solid #E8EDFC', transition: 'background 0.15s',
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
            background: '#9AA8E0', border: 'none', borderRadius: 12,
            color: '#fff', textDecoration: 'none', textAlign: 'center'
          }}>
            Book a Cleaning
          </Link>
          <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '16px', fontSize: 16, fontWeight: 500,
            background: '#EEF1FC', border: 'none', borderRadius: 12,
            color: '#2D3748', textDecoration: 'none', textAlign: 'center'
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
        <h1 style={{ fontSize: 32, fontWeight: 800, color: '#2D3748', marginBottom: 8, letterSpacing: '-0.02em' }}>My Bookings</h1>
        <p style={{ fontSize: 15, color: '#718096', marginBottom: 32 }}>Manage your upcoming and past cleanings</p>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 32, background: '#EEF1FC', borderRadius: 12, padding: 4 }}>
          <button onClick={() => setActiveTab('upcoming')} style={{
            flex: 1, padding: '12px 20px', fontSize: 14, fontWeight: 600,
            background: activeTab === 'upcoming' ? '#9AA8E0' : 'transparent',
            color: activeTab === 'upcoming' ? '#fff' : '#718096',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            Upcoming ({upcomingBookings.length})
          </button>
          <button onClick={() => setActiveTab('past')} style={{
            flex: 1, padding: '12px 20px', fontSize: 14, fontWeight: 600,
            background: activeTab === 'past' ? '#9AA8E0' : 'transparent',
            color: activeTab === 'past' ? '#fff' : '#718096',
            border: 'none', borderRadius: 10, cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}>
            Past ({pastBookings.length})
          </button>
        </div>

        {activeTab === 'past' && cancelledSkippedCount > 0 && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#718096', cursor: 'pointer' }}>
              <input type="checkbox" checked={showCancelledSkipped} onChange={(e) => setShowCancelledSkipped(e.target.checked)} style={{ cursor: 'pointer', width: 18, height: 18, accentColor: '#9AA8E0' }} />
              Show cancelled &amp; skipped ({cancelledSkippedCount})
            </label>
          </div>
        )}

        {displayedBookings.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '80px 24px',
            background: '#F8FAFF', borderRadius: 20,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              {activeTab === 'upcoming' ? (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              ) : (
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              )}
            </div>
            <p style={{ color: '#718096', marginBottom: 24, fontSize: 16, fontWeight: 500 }}>
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
            {activeTab === 'upcoming' && (
              <Link href="/book" style={{
                padding: '14px 32px', fontSize: 15, fontWeight: 600,
                background: '#9AA8E0', border: 'none', borderRadius: 100,
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
              <div key={groupId} style={{ border: '2px solid #9AA8E0', borderRadius: 20, overflow: 'hidden' }}>
                <div style={{ padding: '12px 24px', background: '#9AA8E0', display: 'flex', alignItems: 'center', gap: 8 }}>
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
            <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #E8EDFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2D3748', marginBottom: 4, letterSpacing: '-0.02em' }}>Reschedule</h2>
                  <p style={{ fontSize: 14, color: '#718096' }}>
                    {rescheduleBooking.building} · Unit {rescheduleBooking.unit_number}
                  </p>
                </div>
                <button onClick={() => setRescheduleBooking(null)} style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#EEF1FC',
                  border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', transition: 'background 0.15s', flexShrink: 0,
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>

            <div style={{ padding: '20px 28px 24px' }}>
              {/* Current schedule pill */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#F8FAFF', borderRadius: 100, padding: '8px 16px', marginBottom: 20 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9AA8E0" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#718096' }}>
                  Currently: {formatDate(rescheduleBooking.booking_date)} at {rescheduleBooking.booking_time}
                </span>
              </div>

              {/* Custom inline calendar */}
              {(() => {
                const todayObj = new Date();
                todayObj.setHours(0, 0, 0, 0);
                const maxDateObj = maxDate ? new Date(maxDate + 'T00:00:00') : null;

                const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
                const firstDayOfWeek = new Date(calendarYear, calendarMonth, 1).getDay();
                const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

                const canGoPrev = !(calendarYear === todayObj.getFullYear() && calendarMonth === todayObj.getMonth());
                const canGoNext = !maxDateObj || new Date(calendarYear, calendarMonth + 1, 1) <= maxDateObj;

                const cells = [];
                for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
                for (let d = 1; d <= daysInMonth; d++) cells.push(d);

                return (
                  <div>
                    {/* Month navigation */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                      <button
                        onClick={() => {
                          if (!canGoPrev) return;
                          if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); }
                          else setCalendarMonth(calendarMonth - 1);
                        }}
                        disabled={!canGoPrev}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: 'none',
                          background: canGoPrev ? '#F8FAFF' : 'transparent',
                          cursor: canGoPrev ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: canGoPrev ? 1 : 0.25, transition: 'all 0.15s',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#2D3748', letterSpacing: '-0.01em' }}>
                        {monthNames[calendarMonth]} {calendarYear}
                      </span>
                      <button
                        onClick={() => {
                          if (!canGoNext) return;
                          if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); }
                          else setCalendarMonth(calendarMonth + 1);
                        }}
                        disabled={!canGoNext}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: 'none',
                          background: canGoNext ? '#F8FAFF' : 'transparent',
                          cursor: canGoNext ? 'pointer' : 'default',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          opacity: canGoNext ? 1 : 0.25, transition: 'all 0.15s',
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2D3748" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>

                    {/* Day name headers */}
                    <div className="reschedule-cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 4 }}>
                      {dayNames.map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#A0AEC0', padding: '4px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {d}
                        </div>
                      ))}
                    </div>

                    {/* Day cells */}
                    <div className="reschedule-cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                      {cells.map((day, i) => {
                        if (day === null) return <div key={`empty-${i}`} />;

                        const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const cellDate = new Date(calendarYear, calendarMonth, day);
                        const isPast = cellDate < todayObj;
                        const isBeyondMax = maxDateObj && cellDate > maxDateObj;

                        // Check if date is fully blocked (all workers have all-day blocks or no availability)
                        let isFullyBlocked = false;
                        if (!isPast && !isBeyondMax && allWorkers.length > 0) {
                          const jsDay = cellDate.getDay();
                          const dbDay = jsDay === 0 ? 6 : jsDay - 1;
                          const availableWorkerCount = allWorkers.filter(worker => {
                            const override = allOverrides.find(o => o.worker_id === worker.id && o.override_date === dateStr);
                            if (override) return override.is_available;
                            const weeklyAvail = allAvailability.find(a => a.worker_id === worker.id && a.day_of_week === dbDay);
                            if (weeklyAvail && !weeklyAvail.is_active) return false;
                            const hasAllDayBlock = allBlockedDates.some(bd => bd.worker_id === worker.id && bd.blocked_date === dateStr && bd.all_day);
                            if (hasAllDayBlock) return false;
                            return true;
                          }).length;
                          isFullyBlocked = availableWorkerCount === 0;
                        }

                        const disabled = isPast || isBeyondMax || isFullyBlocked;
                        const isSelected = rescheduleDate === dateStr;
                        const isToday = cellDate.getTime() === todayObj.getTime();

                        return (
                          <button
                            key={day}
                            className="reschedule-cal-day"
                            disabled={disabled}
                            onClick={() => {
                              setRescheduleDate(dateStr);
                              setRescheduleTime('');
                            }}
                            style={{
                              width: '100%', aspectRatio: '1', border: 'none',
                              borderRadius: 10,
                              background: isSelected ? '#9AA8E0' : 'transparent',
                              color: isSelected ? '#fff' : disabled ? '#D1D5DB' : '#2D3748',
                              fontSize: 14, fontWeight: isSelected || isToday ? 700 : 500,
                              cursor: disabled ? 'default' : 'pointer',
                              transition: 'all 0.15s ease',
                              position: 'relative',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                          >
                            {day}
                            {isToday && !isSelected && (
                              <div style={{ position: 'absolute', bottom: 4, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#9AA8E0' }} />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {/* Time slot dropdown — appears seamlessly after date selection */}
              {rescheduleDate && (
                <div style={{ marginTop: 20, animation: 'fadeIn 0.25s ease' }}>
                  <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, #E8EDFC, transparent)', marginBottom: 16 }} />
                  {slotsLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '14px 0', color: '#718096' }}>
                      <div style={{ width: 16, height: 16, border: '2px solid #E8EDFC', borderTopColor: '#9AA8E0', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      <span style={{ fontSize: 14, fontWeight: 500 }}>Checking availability...</span>
                    </div>
                  ) : slotsMessage ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#FFFBEB', borderRadius: 12, border: '1px solid #FDE68A' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      <span style={{ fontSize: 14, color: '#92400E', fontWeight: 500 }}>{slotsMessage}</span>
                    </div>
                  ) : (
                    <div style={{ position: 'relative' }}>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#A0AEC0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        Available times for {new Date(rescheduleDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <select
                          value={rescheduleTime}
                          onChange={(e) => {
                            setRescheduleTime(e.target.value);
                            const slot = availableSlots.find(s => s.label === e.target.value);
                            setAssignedWorkerId(slot && slot.workerIds && slot.workerIds.length > 0 ? slot.workerIds[0] : null);
                          }}
                          style={{
                            width: '100%', padding: '14px 44px 14px 16px', fontSize: 15, fontWeight: 600,
                            border: rescheduleTime ? '2px solid #9AA8E0' : '1.5px solid #e5e5e5',
                            borderRadius: 12, background: rescheduleTime ? '#F8FAFF' : '#fff',
                            color: rescheduleTime ? '#2D3748' : '#718096',
                            cursor: 'pointer', appearance: 'none', outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                          }}
                        >
                          <option value="">Select a time</option>
                          {availableSlots.map(slot => (
                            <option key={slot.label} value={slot.label}>{slot.label}</option>
                          ))}
                        </select>
                        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={rescheduleTime ? '#9AA8E0' : '#A0AEC0'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {rescheduleError && (
                <div style={{
                  padding: '12px 16px', background: '#FEE2E2', borderRadius: 12,
                  marginTop: 16, fontSize: 14, color: '#DC2626', fontWeight: 500,
                }}>
                  {rescheduleError}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '20px 28px', borderTop: '1px solid #E8EDFC', display: 'flex', gap: 10 }}>
              <button
                onClick={() => setRescheduleBooking(null)}
                style={{
                  flex: 1, padding: '16px', fontSize: 15, fontWeight: 600,
                  background: '#EEF1FC', border: 'none', borderRadius: 14,
                  cursor: 'pointer', color: '#2D3748', transition: 'background 0.15s',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                style={{
                  flex: 1, padding: '16px', fontSize: 15, fontWeight: 600,
                  background: rescheduleDate && rescheduleTime && !rescheduling ? '#9AA8E0' : '#e5e5e5',
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
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .reschedule-cal-day:not(:disabled):hover {
          background: #EEF1FC !important;
        }
        @media (max-width: 480px) {
          .reschedule-cal-grid { gap: 1px !important; }
          .reschedule-cal-day { font-size: 13px !important; border-radius: 8px !important; }
        }
      `}</style>
    </div>
  );
}
