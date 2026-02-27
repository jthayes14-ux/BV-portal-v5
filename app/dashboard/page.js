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

function formatHour(hour) {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:00 ${ampm}`;
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

  // Sorting
  const [sortField, setSortField] = useState('booking_date');
  const [sortDirection, setSortDirection] = useState('asc');

  // Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reschedule state
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');

  // Real availability data for reschedule
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState('');
  const [serviceSettings, setServiceSettings] = useState({});
  const [allAvailability, setAllAvailability] = useState([]);
  const [allBlockedDates, setAllBlockedDates] = useState([]);
  const [allOverrides, setAllOverrides] = useState([]);
  const [allWorkers, setAllWorkers] = useState([]);
  const [maxDate, setMaxDate] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (!authLoading && user) loadData();
  }, [authLoading, user]);

  // Compute available slots when reschedule date changes
  useEffect(() => {
    if (!rescheduleDate) {
      setAvailableSlots([]);
      setSlotsMessage('');
      return;
    }
    computeAvailableSlots(rescheduleDate);
  }, [rescheduleDate, allAvailability, allBlockedDates, allOverrides, allWorkers, serviceSettings]);

  const loadData = async () => {
    const [bkRes, fqRes, svcRes, avRes, bdRes, soRes, wRes] = await Promise.all([
      supabase.from('bookings').select('*').eq('user_id', user.id).order('booking_date', { ascending: false }).limit(10000),
      supabase.from('frequencies').select('*').order('sort_order'),
      supabase.from('site_settings').select('*'),
      supabase.from('availability').select('*').order('day_of_week'),
      supabase.from('blocked_dates').select('*').order('blocked_date'),
      supabase.from('schedule_overrides').select('*').order('override_date'),
      supabase.from('workers').select('*').eq('archived', false).order('name'),
    ]);
    setBookings(bkRes.data || []);
    setFrequencies(fqRes.data || []);
    setAllAvailability(avRes.data || []);
    setAllBlockedDates(bdRes.data || []);
    setAllOverrides(soRes.data || []);
    setAllWorkers(wRes.data || []);

    const svcMap = {};
    (svcRes.data || []).forEach(s => { svcMap[s.key] = s.value; });
    setServiceSettings(svcMap);

    const advanceDays = Number(svcMap.advance_booking_days) || 30;
    const max = new Date();
    max.setDate(max.getDate() + advanceDays);
    setMaxDate(max.toISOString().split('T')[0]);

    setDataLoading(false);
  };

  const computeAvailableSlots = async (selectedDate) => {
    setSlotsLoading(true);
    setSlotsMessage('');
    setAvailableSlots([]);
    setRescheduleTime('');

    const slotDuration = Number(serviceSettings.slot_duration_minutes) || 60;
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
        .select('booking_time, worker_id')
        .eq('booking_date', selectedDate)
        .in('status', ['upcoming', 'scheduled']);
      const bookedSlots = existingBookings || [];
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

        const workerBookings = bookedSlots.filter(b => b.worker_id === worker.id);
        const bookedRanges = workerBookings.map(b => {
          const match = (b.booking_time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
          if (!match) return null;
          let h = parseInt(match[1], 10);
          const m = parseInt(match[2], 10);
          const ampm = match[3].toUpperCase();
          if (ampm === 'PM' && h !== 12) h += 12;
          if (ampm === 'AM' && h === 12) h = 0;
          const s = h * 60 + m;
          return { start: s, end: s + slotDuration + buffer };
        }).filter(Boolean);

        const partialBlocks = blocked.filter(bd => !bd.all_day).map(bd => {
          const bStart = parseInt(bd.start_time?.slice(0, 2) || '0', 10) * 60 + parseInt(bd.start_time?.slice(3, 5) || '0', 10);
          const bEnd = parseInt(bd.end_time?.slice(0, 2) || '0', 10) * 60 + parseInt(bd.end_time?.slice(3, 5) || '0', 10);
          return { start: bStart, end: bEnd };
        });

        for (let slotStart = startMinutes; slotStart + slotDuration <= endMinutes; slotStart += 60) {
          const slotEnd = slotStart + slotDuration;
          if (selectedDate === now.toISOString().split('T')[0]) {
            const slotDateTime = new Date(selectedDate + 'T00:00:00');
            slotDateTime.setMinutes(slotDateTime.getMinutes() + slotStart);
            if (slotDateTime < minNoticeTime) continue;
          }
          if (bookedRanges.some(r => slotStart < r.end && slotEnd > r.start)) continue;
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
            const m2 = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (!m2) return 0;
            let h2 = parseInt(m2[1], 10);
            if (m2[3].toUpperCase() === 'PM' && h2 !== 12) h2 += 12;
            if (m2[3].toUpperCase() === 'AM' && h2 === 12) h2 = 0;
            return h2 * 60 + parseInt(m2[2], 10);
          };
          return parseTime(a.label) - parseTime(b.label);
        });

      if (slots.length === 0) setSlotsMessage('No times available for this date.');
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
      if (slots.length === 0) setSlotsMessage('No times available for this date.');
      setAvailableSlots(slots);
    }

    setSlotsLoading(false);
  };

  const getFrequencyName = (frequencyId) => {
    return frequencies.find(f => f.id === frequencyId)?.name || '';
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const today = new Date().toISOString().split('T')[0];
  const minDate = (() => {
    const minNoticeHours = Number(serviceSettings.minimum_notice_hours) || 24;
    const d = new Date(Date.now() + minNoticeHours * 60 * 60 * 1000);
    return d.toISOString().split('T')[0];
  })();

  const openReschedule = (booking) => {
    setRescheduleBooking(booking);
    setRescheduleDate('');
    setRescheduleTime('');
    setRescheduleError('');
    setAvailableSlots([]);
    setSlotsMessage('');
  };

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) {
      setRescheduleError('Please select both a date and time.');
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

  // Search filter
  const filteredBookings = displayedBookings.filter(b => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !(b.building || '').toLowerCase().includes(q) &&
        !(b.unit_number || '').toLowerCase().includes(q) &&
        !(b.floor_plan || '').toLowerCase().includes(q) &&
        !(b.booking_time || '').toLowerCase().includes(q)
      ) return false;
    }
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    return true;
  });

  // Sorting
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    switch (sortField) {
      case 'booking_date':
        return ((a.booking_date || '').localeCompare(b.booking_date || '')) * dir;
      case 'building':
        return ((a.building || '').localeCompare(b.building || '')) * dir;
      case 'total_price':
        return ((Number(a.total_price) || 0) - (Number(b.total_price) || 0)) * dir;
      case 'status':
        return ((a.status || '').localeCompare(b.status || '')) * dir;
      default:
        return 0;
    }
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortIndicator = (field) => sortField === field ? (sortDirection === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric'
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

  return (
    <div style={{ minHeight: '100vh', background: '#F9FAFB', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      {/* Header */}
      <header className="dashboard-header" style={{
        padding: '14px 24px', background: '#fff', borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>BetterView</span>
        </Link>
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/book" style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 600,
            background: '#6366F1', borderRadius: 8, color: '#fff', textDecoration: 'none',
            transition: 'all 150ms ease', display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Book a Cleaning
          </Link>
          <div style={{ position: 'relative' }}>
            <div onClick={() => setProfileMenuOpen(!profileMenuOpen)} style={{
              width: 34, height: 34, background: '#6366F1', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer', userSelect: 'none',
            }}>
              {userInitial}
            </div>
            {profileMenuOpen && (
              <>
                <div onClick={() => setProfileMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: '#fff', borderRadius: 10,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                  minWidth: 180, zIndex: 100, overflow: 'hidden',
                }}>
                  <Link href="/dashboard/settings" onClick={() => setProfileMenuOpen(false)} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                    fontSize: 13, fontWeight: 500, color: '#111827', textDecoration: 'none',
                    borderBottom: '1px solid #E5E7EB', transition: 'background 150ms',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                    Settings
                  </Link>
                  <button onClick={() => { setProfileMenuOpen(false); handleLogout(); }} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px',
                    fontSize: 13, fontWeight: 500, color: '#DC2626', background: 'none',
                    border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
                  }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
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
            padding: '14px', fontSize: 15, fontWeight: 600,
            background: '#6366F1', border: 'none', borderRadius: 10,
            color: '#fff', textDecoration: 'none', textAlign: 'center'
          }}>
            Book a Cleaning
          </Link>
          <Link href="/dashboard/settings" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '14px', fontSize: 15, fontWeight: 500,
            background: '#F3F4F6', border: 'none', borderRadius: 10,
            color: '#111827', textDecoration: 'none', textAlign: 'center'
          }}>
            Settings
          </Link>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{
            padding: '14px', fontSize: 15, fontWeight: 500,
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10,
            color: '#DC2626', cursor: 'pointer'
          }}>
            Log Out
          </button>
        </div>
      </header>

      <main className="dashboard-main" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        {/* Page Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>My Bookings</h1>
            <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
          <Link href="/book" style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 600,
            background: '#6366F1', borderRadius: 8, color: '#fff', textDecoration: 'none',
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Booking
          </Link>
        </div>

        {/* Tabs + Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'inline-flex', background: '#F3F4F6', borderRadius: 8, padding: 3 }}>
            <button onClick={() => setActiveTab('upcoming')} style={{
              padding: '7px 16px', fontSize: 13, fontWeight: 600,
              background: activeTab === 'upcoming' ? '#fff' : 'transparent',
              color: activeTab === 'upcoming' ? '#111827' : '#6B7280',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              transition: 'all 150ms ease',
              boxShadow: activeTab === 'upcoming' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
              Upcoming ({upcomingBookings.length})
            </button>
            <button onClick={() => setActiveTab('past')} style={{
              padding: '7px 16px', fontSize: 13, fontWeight: 600,
              background: activeTab === 'past' ? '#fff' : 'transparent',
              color: activeTab === 'past' ? '#111827' : '#6B7280',
              border: 'none', borderRadius: 6, cursor: 'pointer',
              transition: 'all 150ms ease',
              boxShadow: activeTab === 'past' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}>
              Past ({pastBookings.length})
            </button>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  padding: '7px 10px 7px 30px', fontSize: 13, border: '1px solid #E5E7EB',
                  borderRadius: 8, outline: 'none', background: '#fff', width: 180,
                  fontFamily: "'Inter', -apple-system, sans-serif",
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>
            {activeTab === 'past' && cancelledSkippedCount > 0 && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={showCancelledSkipped} onChange={(e) => setShowCancelledSkipped(e.target.checked)} style={{ cursor: 'pointer', accentColor: '#6366F1' }} />
                Cancelled/Skipped
              </label>
            )}
          </div>
        </div>

        {/* Bookings Table */}
        {sortedBookings.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '64px 24px',
            background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB',
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: '#EEF2FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <p style={{ color: '#111827', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
              {activeTab === 'upcoming' ? 'No upcoming bookings' : 'No past bookings'}
            </p>
            <p style={{ color: '#6B7280', fontSize: 13, marginBottom: 20 }}>
              {activeTab === 'upcoming' ? 'Schedule your first cleaning to get started.' : 'Your completed bookings will appear here.'}
            </p>
            {activeTab === 'upcoming' && (
              <Link href="/book" style={{
                padding: '8px 20px', fontSize: 13, fontWeight: 600,
                background: '#6366F1', border: 'none', borderRadius: 8,
                color: '#fff', textDecoration: 'none', display: 'inline-block',
              }}>
                Book a Cleaning
              </Link>
            )}
          </div>
        ) : (
          <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
                <thead>
                  <tr>
                    {[
                      { field: 'booking_date', label: 'Date' },
                      { field: 'building', label: 'Property' },
                      { field: 'total_price', label: 'Price' },
                      { field: 'status', label: 'Status' },
                    ].map(col => (
                      <th key={col.field} onClick={() => handleSort(col.field)} style={{
                        padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600,
                        color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em',
                        cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap',
                        background: '#F9FAFB', borderBottom: '1px solid #E5E7EB',
                      }}>
                        {col.label}{sortIndicator(col.field)}
                      </th>
                    ))}
                    <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedBookings.map((booking, idx) => {
                    const freqName = getFrequencyName(booking.frequency_id);
                    const statusStyle = getStatusStyle(booking.status);

                    return (
                      <tr key={booking.id} style={{
                        borderBottom: idx < sortedBookings.length - 1 ? '1px solid #F3F4F6' : 'none',
                        transition: 'background 150ms',
                      }}>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{formatDate(booking.booking_date)}</p>
                          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{booking.booking_time}</p>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <p style={{ fontSize: 13, fontWeight: 500, color: '#111827' }}>{booking.building}</p>
                          <p style={{ fontSize: 12, color: '#6B7280', marginTop: 1 }}>Unit {booking.unit_number} · {booking.floor_plan}</p>
                          {freqName && freqName !== 'One-Time' && (
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#4338CA', background: '#EEF2FF', padding: '1px 6px', borderRadius: 4, marginTop: 3, display: 'inline-block' }}>{freqName}</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#111827' }}>${booking.total_price}</span>
                          {booking.add_ons && booking.add_ons.length > 0 && (
                            <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>+{booking.add_ons.length} add-on{booking.add_ons.length !== 1 ? 's' : ''}</p>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ padding: '3px 10px', borderRadius: 100, fontSize: 11, fontWeight: 600, textTransform: 'capitalize', ...statusStyle }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                            {(booking.status === 'upcoming' || booking.status === 'scheduled') && (
                              <>
                                <button onClick={() => openReschedule(booking)} style={{
                                  padding: '6px 12px', fontSize: 12, fontWeight: 600,
                                  background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6,
                                  cursor: 'pointer', color: '#111827', transition: 'all 150ms',
                                }}>Reschedule</button>
                                <button onClick={async () => {
                                  if (confirm('Cancel this booking?')) {
                                    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', booking.id);
                                    setBookings(bookings.map(b => b.id === booking.id ? { ...b, status: 'cancelled' } : b));
                                  }
                                }} style={{
                                  padding: '6px 12px', fontSize: 12, fontWeight: 600,
                                  background: '#fff', border: '1px solid #FCA5A5', borderRadius: 6,
                                  cursor: 'pointer', color: '#DC2626', transition: 'all 150ms',
                                }}>Cancel</button>
                              </>
                            )}
                            {(booking.status === 'completed' || booking.status === 'skipped' || booking.status === 'cancelled') && (
                              <button onClick={() => handleBookAgain(booking)} style={{
                                padding: '6px 12px', fontSize: 12, fontWeight: 600,
                                background: '#6366F1', border: 'none', borderRadius: 6,
                                cursor: 'pointer', color: '#fff', transition: 'all 150ms',
                              }}>Book Again</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div onClick={(e) => { if (e.target === e.currentTarget) setRescheduleBooking(null); }} style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 24,
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 480, width: '100%',
            position: 'relative', overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
            animation: 'scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}>
            {/* Modal header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>Reschedule Booking</h2>
                <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>
                  {rescheduleBooking.building} · Unit {rescheduleBooking.unit_number}
                </p>
              </div>
              <button onClick={() => setRescheduleBooking(null)} style={{
                width: 32, height: 32, borderRadius: 8, background: '#F3F4F6',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', transition: 'background 150ms', flexShrink: 0,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding: '20px 24px' }}>
              {/* Current booking info */}
              <div style={{ background: '#F9FAFB', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Currently scheduled</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{formatDate(rescheduleBooking.booking_date)} at {rescheduleBooking.booking_time}</p>
                </div>
              </div>

              {/* Step 1: Select Date */}
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                  Select new date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  min={minDate}
                  max={maxDate}
                  style={{
                    width: '100%', padding: '10px 14px', fontSize: 14,
                    border: '1px solid #E5E7EB', borderRadius: 8,
                    boxSizing: 'border-box', background: '#fff',
                    outline: 'none', transition: 'border-color 150ms',
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                  onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                />
              </div>

              {/* Step 2: Select Time (only shows after date is selected) */}
              {rescheduleDate && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
                    Select available time
                  </label>
                  {slotsLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <div style={{ width: 24, height: 24, border: '2px solid #E5E7EB', borderTopColor: '#6366F1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 12, color: '#6B7280' }}>Checking availability...</p>
                    </div>
                  ) : slotsMessage ? (
                    <div style={{ padding: '16px', background: '#FEF3C7', borderRadius: 8, fontSize: 13, color: '#92400E', textAlign: 'center' }}>
                      {slotsMessage}
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
                      {availableSlots.map(slot => (
                        <button
                          key={slot.label}
                          onClick={() => setRescheduleTime(slot.label)}
                          style={{
                            padding: '10px 8px', fontSize: 13, fontWeight: 600,
                            border: rescheduleTime === slot.label ? '2px solid #6366F1' : '1px solid #E5E7EB',
                            borderRadius: 8, cursor: 'pointer',
                            background: rescheduleTime === slot.label ? '#6366F1' : '#fff',
                            color: rescheduleTime === slot.label ? '#fff' : '#111827',
                            transition: 'all 150ms ease',
                          }}
                        >
                          {slot.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {rescheduleError && (
                <div style={{
                  padding: '10px 14px', background: '#FEE2E2', borderRadius: 8,
                  marginBottom: 16, fontSize: 13, color: '#DC2626', fontWeight: 500,
                }}>
                  {rescheduleError}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #E5E7EB', display: 'flex', gap: 8 }}>
              <button
                onClick={() => setRescheduleBooking(null)}
                style={{
                  flex: 1, padding: '10px', fontSize: 13, fontWeight: 600,
                  background: '#F3F4F6', border: 'none', borderRadius: 8,
                  cursor: 'pointer', color: '#111827',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleReschedule}
                disabled={rescheduling || !rescheduleDate || !rescheduleTime}
                style={{
                  flex: 1, padding: '10px', fontSize: 13, fontWeight: 600,
                  background: rescheduleDate && rescheduleTime && !rescheduling ? '#6366F1' : '#E5E7EB',
                  color: rescheduleDate && rescheduleTime && !rescheduling ? '#fff' : '#9CA3AF',
                  border: 'none', borderRadius: 8,
                  cursor: rescheduleDate && rescheduleTime && !rescheduling ? 'pointer' : 'not-allowed',
                  transition: 'all 150ms ease',
                }}
              >
                {rescheduling ? 'Updating...' : 'Confirm Reschedule'}
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
