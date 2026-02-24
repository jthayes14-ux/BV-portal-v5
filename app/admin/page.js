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

const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export default function AdminPanel() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('bookings');
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [frequencies, setFrequencies] = useState([]);
  const [userProfiles, setUserProfiles] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [expandedCustomer, setExpandedCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [editingBookingId, setEditingBookingId] = useState(null);
  const [editingBookingValue, setEditingBookingValue] = useState({});
  const [editingCustomerEmail, setEditingCustomerEmail] = useState(null);
  const [editingCustomerValue, setEditingCustomerValue] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({});
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sortField, setSortField] = useState('booking_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showCancelled, setShowCancelled] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);
  const [showArchivedAddOns, setShowArchivedAddOns] = useState(false);
  const [addonsSectionVisible, setAddonsSectionVisible] = useState(true);

  // Availability management state
  const [availabilitySubTab, setAvailabilitySubTab] = useState('weekly');
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [scheduleOverrides, setScheduleOverrides] = useState([]);
  const [serviceSettings, setServiceSettings] = useState({});
  const [selectedWorkerAvail, setSelectedWorkerAvail] = useState('');
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [availSaving, setAvailSaving] = useState(false);

  // Blocked dates form
  const [blockedDateForm, setBlockedDateForm] = useState({ worker_id: '', blocked_date: '', all_day: true, start_time: '08:00', end_time: '17:00', reason: '' });

  // Schedule overrides form
  const [overrideForm, setOverrideForm] = useState({ worker_id: '', override_date: '', start_time: '08:00', end_time: '17:00', is_available: true, reason: '' });

  // Service settings editing
  const [editingSettings, setEditingSettings] = useState(null);

  // Calendar state for blocked dates
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa', white: '#ffffff',
    danger: '#dc2626', success: '#22c55e', gold: '#C9B037',
  };

  const tabs = [
    { id: 'bookings', label: 'Bookings' },
    { id: 'customers', label: 'Customers' },
    { id: 'frequencies', label: 'Frequencies' },
    { id: 'neighborhoods', label: 'Neighborhoods' },
    { id: 'buildings', label: 'Buildings' },
    { id: 'floorplans', label: 'Floor Plans' },
    { id: 'addons', label: 'Add-Ons' },
    { id: 'workers', label: 'Workers' },
    { id: 'availability', label: 'Availability' },
  ];

  const buttonStyle = { padding: '8px 16px', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 6, cursor: 'pointer' };
  const inputStyle = { padding: '10px 12px', fontSize: 14, border: `1px solid ${brand.border}`, borderRadius: 6, width: '100%', boxSizing: 'border-box' };

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user && !ADMIN_EMAILS.includes(user.email?.toLowerCase())) { router.push('/dashboard'); return; }
    if (!authLoading && user) loadAll();
  }, [authLoading, user]);

  const loadAll = async () => {
    const [nRes, bRes, fpRes, aoRes, bkRes, wRes, fqRes, upRes, ssRes, avRes, bdRes, soRes, svcRes] = await Promise.all([
      supabase.from('neighborhoods').select('*').order('name'),
      supabase.from('buildings').select('*').order('name'),
      supabase.from('floor_plans').select('*').order('name'),
      supabase.from('add_ons').select('*').order('name'),
      supabase.from('bookings').select('*').order('booking_date', { ascending: false }).limit(10000),
      supabase.from('workers').select('*').order('name'),
      supabase.from('frequencies').select('*').order('sort_order'),
      supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').eq('key', 'addons_section_visible').single(),
      supabase.from('availability').select('*').order('day_of_week'),
      supabase.from('blocked_dates').select('*').order('blocked_date'),
      supabase.from('schedule_overrides').select('*').order('override_date'),
      supabase.from('service_settings').select('*'),
    ]);
    setNeighborhoods(nRes.data || []);
    setBuildings(bRes.data || []);
    setFloorPlans(fpRes.data || []);
    setAddOns(aoRes.data || []);
    setBookings(bkRes.data || []);
    setWorkers(wRes.data || []);
    setFrequencies(fqRes.data || []);
    setUserProfiles(upRes.data || []);
    if (ssRes.data) setAddonsSectionVisible(ssRes.data.value === 'true');
    setAvailability(avRes.data || []);
    setBlockedDates(bdRes.data || []);
    setScheduleOverrides(soRes.data || []);
    // Convert service_settings array to object
    const settingsObj = {};
    (svcRes.data || []).forEach(s => { settingsObj[s.key] = s.value; });
    setServiceSettings(settingsObj);
    setDataLoading(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const [crudError, setCrudError] = useState('');

  // Generic CRUD
  const handleAdd = async (type) => {
    setCrudError('');
    let result;
    switch (type) {
      case 'neighborhoods':
        result = await supabase.from('neighborhoods').insert({ name: 'New Neighborhood' }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setNeighborhoods([...neighborhoods, result.data]); setEditingId(`neighborhood-${result.data.id}`); setEditValue({ name: 'New Neighborhood' }); }
        break;
      case 'buildings':
        result = await supabase.from('buildings').insert({ name: 'New Building', address: '', neighborhood_id: neighborhoods[0]?.id }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setBuildings([...buildings, result.data]); setEditingId(`building-${result.data.id}`); setEditValue({ name: 'New Building', address: '', neighborhood_id: neighborhoods[0]?.id }); }
        break;
      case 'floorplans':
        result = await supabase.from('floor_plans').insert({ name: 'New Floor Plan', price: 0, building_id: buildings[0]?.id }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setFloorPlans([...floorPlans, result.data]); setEditingId(`floorplan-${result.data.id}`); setEditValue({ name: 'New Floor Plan', price: 0, building_id: buildings[0]?.id }); }
        break;
      case 'addons':
        result = await supabase.from('add_ons').insert({ name: 'New Add-On', price: 0 }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setAddOns([...addOns, result.data]); setEditingId(`addon-${result.data.id}`); setEditValue({ name: 'New Add-On', price: 0 }); }
        break;
      case 'workers':
        result = await supabase.from('workers').insert({ name: 'New Worker', email: '', phone: '' }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setWorkers([...workers, result.data]); setEditingId(`worker-${result.data.id}`); setEditValue({ name: 'New Worker', email: '', phone: '' }); }
        break;
      case 'frequencies': {
        const maxSort = frequencies.reduce((max, f) => Math.max(max, f.sort_order || 0), 0);
        result = await supabase.from('frequencies').insert({ name: 'New Frequency', discount_percent: 0, interval_days: 0, sort_order: maxSort + 1 }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setFrequencies([...frequencies, result.data]); setEditingId(`frequency-${result.data.id}`); setEditValue({ name: 'New Frequency', discount_percent: 0, interval_days: 0, sort_order: maxSort + 1 }); }
        break;
      }
    }
  };

  const handleSave = async (type, id) => {
    setCrudError('');
    let result;
    switch (type) {
      case 'neighborhoods':
        result = await supabase.from('neighborhoods').update({ name: editValue.name }).eq('id', id);
        break;
      case 'buildings':
        result = await supabase.from('buildings').update(editValue).eq('id', id);
        break;
      case 'floorplans':
        result = await supabase.from('floor_plans').update(editValue).eq('id', id);
        break;
      case 'addons':
        result = await supabase.from('add_ons').update(editValue).eq('id', id);
        break;
      case 'workers':
        result = await supabase.from('workers').update(editValue).eq('id', id);
        break;
      case 'frequencies':
        result = await supabase.from('frequencies').update(editValue).eq('id', id);
        break;
    }
    if (result?.error) {
      setCrudError('Failed to save: ' + result.error.message);
      return;
    }
    // Update local state only on success
    switch (type) {
      case 'neighborhoods': setNeighborhoods(neighborhoods.map(n => n.id === id ? { ...n, ...editValue } : n)); break;
      case 'buildings': setBuildings(buildings.map(b => b.id === id ? { ...b, ...editValue } : b)); break;
      case 'floorplans': setFloorPlans(floorPlans.map(f => f.id === id ? { ...f, ...editValue } : f)); break;
      case 'addons': setAddOns(addOns.map(a => a.id === id ? { ...a, ...editValue } : a)); break;
      case 'workers': setWorkers(workers.map(w => w.id === id ? { ...w, ...editValue } : w)); break;
      case 'frequencies': setFrequencies(frequencies.map(f => f.id === id ? { ...f, ...editValue } : f)); break;
    }
    setEditingId(null);
    setEditValue({});
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    setCrudError('');
    const tableMap = { neighborhoods: 'neighborhoods', buildings: 'buildings', floorplans: 'floor_plans', addons: 'add_ons', workers: 'workers', frequencies: 'frequencies' };
    const { error: deleteError } = await supabase.from(tableMap[type]).delete().eq('id', id);
    if (deleteError) {
      setCrudError('Failed to delete: ' + deleteError.message);
      return;
    }
    switch (type) {
      case 'neighborhoods': setNeighborhoods(neighborhoods.filter(n => n.id !== id)); break;
      case 'buildings': setBuildings(buildings.filter(b => b.id !== id)); break;
      case 'floorplans': setFloorPlans(floorPlans.filter(f => f.id !== id)); break;
      case 'addons': setAddOns(addOns.filter(a => a.id !== id)); break;
      case 'workers': setWorkers(workers.filter(w => w.id !== id)); break;
      case 'frequencies': setFrequencies(frequencies.filter(f => f.id !== id)); break;
    }
  };

  const handleToggleArchiveAddon = async (id, currentArchived) => {
    setCrudError('');
    const newArchived = !currentArchived;
    const { error } = await supabase.from('add_ons').update({ archived: newArchived }).eq('id', id);
    if (error) { setCrudError('Failed to update: ' + error.message); return; }
    setAddOns(addOns.map(a => a.id === id ? { ...a, archived: newArchived } : a));
  };

  const handleToggleAddonsSection = async () => {
    const newValue = !addonsSectionVisible;
    const { error } = await supabase.from('site_settings').upsert({ key: 'addons_section_visible', value: String(newValue), updated_at: new Date().toISOString() });
    if (error) { setCrudError('Failed to update setting: ' + error.message); return; }
    setAddonsSectionVisible(newValue);
  };

  // === Availability Management Handlers ===

  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getWorkerAvailability = (workerId) => {
    return DAY_NAMES.map((_, idx) => {
      const existing = availability.find(a => a.worker_id === workerId && a.day_of_week === idx);
      return existing || { worker_id: workerId, day_of_week: idx, start_time: '08:00', end_time: '17:00', is_active: true, isNew: true };
    });
  };

  const handleSaveWeeklySchedule = async (workerId) => {
    if (!editingAvailability || !workerId) return;
    setAvailSaving(true);
    setCrudError('');
    try {
      for (const day of editingAvailability) {
        const payload = {
          worker_id: workerId,
          day_of_week: day.day_of_week,
          start_time: day.start_time,
          end_time: day.end_time,
          is_active: day.is_active,
          updated_at: new Date().toISOString(),
        };
        const existing = availability.find(a => a.worker_id === workerId && a.day_of_week === day.day_of_week);
        if (existing) {
          const { error } = await supabase.from('availability').update(payload).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('availability').insert(payload);
          if (error) throw error;
        }
      }
      // Reload availability
      const { data } = await supabase.from('availability').select('*').order('day_of_week');
      setAvailability(data || []);
      setEditingAvailability(null);
    } catch (err) {
      setCrudError('Failed to save schedule: ' + err.message);
    }
    setAvailSaving(false);
  };

  const handleAddBlockedDate = async () => {
    setCrudError('');
    if (!blockedDateForm.worker_id || !blockedDateForm.blocked_date) {
      setCrudError('Please select a worker and date.');
      return;
    }
    const payload = {
      worker_id: blockedDateForm.worker_id,
      blocked_date: blockedDateForm.blocked_date,
      all_day: blockedDateForm.all_day,
      start_time: blockedDateForm.all_day ? null : blockedDateForm.start_time,
      end_time: blockedDateForm.all_day ? null : blockedDateForm.end_time,
      reason: blockedDateForm.reason,
    };
    const { data, error } = await supabase.from('blocked_dates').insert(payload).select().single();
    if (error) { setCrudError('Failed to add blocked date: ' + error.message); return; }
    setBlockedDates([...blockedDates, data]);
    setBlockedDateForm({ worker_id: blockedDateForm.worker_id, blocked_date: '', all_day: true, start_time: '08:00', end_time: '17:00', reason: '' });
  };

  const handleDeleteBlockedDate = async (id) => {
    if (!confirm('Remove this blocked date?')) return;
    const { error } = await supabase.from('blocked_dates').delete().eq('id', id);
    if (error) { setCrudError('Failed to delete: ' + error.message); return; }
    setBlockedDates(blockedDates.filter(bd => bd.id !== id));
  };

  const handleAddOverride = async () => {
    setCrudError('');
    if (!overrideForm.worker_id || !overrideForm.override_date) {
      setCrudError('Please select a worker and date.');
      return;
    }
    const payload = {
      worker_id: overrideForm.worker_id,
      override_date: overrideForm.override_date,
      start_time: overrideForm.start_time,
      end_time: overrideForm.end_time,
      is_available: overrideForm.is_available,
      reason: overrideForm.reason,
    };
    const { data, error } = await supabase.from('schedule_overrides').insert(payload).select().single();
    if (error) { setCrudError('Failed to add override: ' + error.message); return; }
    setScheduleOverrides([...scheduleOverrides, data]);
    setOverrideForm({ worker_id: overrideForm.worker_id, override_date: '', start_time: '08:00', end_time: '17:00', is_available: true, reason: '' });
  };

  const handleDeleteOverride = async (id) => {
    if (!confirm('Remove this schedule override?')) return;
    const { error } = await supabase.from('schedule_overrides').delete().eq('id', id);
    if (error) { setCrudError('Failed to delete: ' + error.message); return; }
    setScheduleOverrides(scheduleOverrides.filter(so => so.id !== id));
  };

  const handleSaveServiceSettings = async () => {
    setCrudError('');
    setAvailSaving(true);
    try {
      for (const [key, value] of Object.entries(editingSettings)) {
        const { error } = await supabase.from('service_settings').upsert({ key, value: String(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
        if (error) throw error;
      }
      setServiceSettings({ ...serviceSettings, ...editingSettings });
      setEditingSettings(null);
    } catch (err) {
      setCrudError('Failed to save settings: ' + err.message);
    }
    setAvailSaving(false);
  };

  const getCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    // Pad start to Monday (getDay: 0=Sun, 1=Mon, ..., 6=Sat)
    let startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = startPad; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ date: d, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Pad end
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, days.length - startPad - lastDay.getDate() + 1);
      days.push({ date: d, isCurrentMonth: false });
    }
    return days;
  };

  const formatDateISO = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const handleWorkerAssign = async (bookingId, workerId) => {
    await supabase.from('bookings').update({ worker_id: workerId || null }).eq('id', bookingId);
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, worker_id: workerId || null } : b));
  };

  const handleMarkComplete = async (bookingId) => {
    await supabase.from('bookings').update({ status: 'completed' }).eq('id', bookingId);
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'completed' } : b));
  };

  const handleSkipBooking = async (bookingId) => {
    if (!confirm('Skip this booking? It will be marked as skipped.')) return;
    await supabase.from('bookings').update({ status: 'skipped' }).eq('id', bookingId);
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'skipped' } : b));
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Cancel this booking? This cannot be undone.')) return;
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
  };

  const handleSaveBookingEdit = async (bookingId) => {
    setCrudError('');
    const updates = {};
    if (editingBookingValue.booking_date !== undefined) updates.booking_date = editingBookingValue.booking_date;
    if (editingBookingValue.booking_time !== undefined) updates.booking_time = editingBookingValue.booking_time;
    if (editingBookingValue.worker_id !== undefined) updates.worker_id = editingBookingValue.worker_id || null;
    if (editingBookingValue.unit_number !== undefined) updates.unit_number = editingBookingValue.unit_number;
    if (editingBookingValue.special_instructions !== undefined) updates.special_instructions = editingBookingValue.special_instructions;
    const { error } = await supabase.from('bookings').update(updates).eq('id', bookingId);
    if (error) { setCrudError('Failed to update booking: ' + error.message); return; }
    setBookings(bookings.map(b => b.id === bookingId ? { ...b, ...updates } : b));
    setEditingBookingId(null);
    setEditingBookingValue({});
  };

  const handleSaveCustomerInfo = async (customerEmail, customerBookings, userId) => {
    setCrudError('');
    const updates = {};
    if (editingCustomerValue.customer_name !== undefined) updates.customer_name = editingCustomerValue.customer_name;
    if (editingCustomerValue.customer_email !== undefined) updates.customer_email = editingCustomerValue.customer_email;

    // Update all bookings for this customer
    const bookingIds = customerBookings.map(b => b.id);
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('bookings').update(updates).in('id', bookingIds);
      if (error) { setCrudError('Failed to update customer info: ' + error.message); return; }
      setBookings(bookings.map(b => bookingIds.includes(b.id) ? { ...b, ...updates } : b));
    }

    // Update user_profiles if they have an account
    if (userId) {
      const profileUpdates = {};
      if (editingCustomerValue.customer_name !== undefined) {
        const parts = editingCustomerValue.customer_name.trim().split(/\s+/);
        profileUpdates.first_name = parts[0] || '';
        profileUpdates.last_name = parts.slice(1).join(' ') || '';
      }
      if (editingCustomerValue.phone !== undefined) profileUpdates.phone = editingCustomerValue.phone;
      if (Object.keys(profileUpdates).length > 0) {
        await supabase.from('user_profiles').update(profileUpdates).eq('user_id', userId);
        setUserProfiles(userProfiles.map(up => up.user_id === userId ? { ...up, ...profileUpdates } : up));
      }
    }

    setEditingCustomerEmail(null);
    setEditingCustomerValue({});
  };

  const getFrequencyName = (frequencyId) => {
    return frequencies.find(f => f.id === frequencyId)?.name || '';
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredBookings = bookings.filter(b => {
    if (b.status === 'cancelled' && !showCancelled) return false;
    if (b.status === 'skipped' && !showSkipped) return false;
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    let aVal, bVal;
    switch (sortField) {
      case 'customer_name':
        aVal = (a.customer_name || '').toLowerCase();
        bVal = (b.customer_name || '').toLowerCase();
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'building':
        aVal = (a.building || '').toLowerCase();
        bVal = (b.building || '').toLowerCase();
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'booking_date':
        aVal = a.booking_date || '';
        bVal = b.booking_date || '';
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'total_price':
        aVal = Number(a.total_price) || 0;
        bVal = Number(b.total_price) || 0;
        return (aVal - bVal) * dir;
      case 'status':
        aVal = (a.status || '').toLowerCase();
        bVal = (b.status || '').toLowerCase();
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'worker_id':
        aVal = (workers.find(w => w.id === a.worker_id)?.name || 'zzz').toLowerCase();
        bVal = (workers.find(w => w.id === b.worker_id)?.name || 'zzz').toLowerCase();
        return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      default:
        return 0;
    }
  });

  const sortIndicator = (field) => sortField === field ? (sortDirection === 'asc' ? ' \u25B2' : ' \u25BC') : '';

  const filteredBuildings = selectedNeighborhood ? buildings.filter(b => b.neighborhood_id === selectedNeighborhood) : buildings;
  const filteredFloorPlans = selectedBuilding ? floorPlans.filter(f => f.building_id === selectedBuilding) : floorPlans;

  const handleLogout = async () => { await signOut(); router.push('/login'); };

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

  if (authLoading || dataLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}><p style={{ color: brand.textLight }}>Loading...</p></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      <header className="admin-header" style={{ padding: '16px 32px', background: brand.white, borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
          <span style={{ marginLeft: 12, padding: '4px 10px', background: brand.text, color: brand.white, borderRadius: 4, fontSize: 12, fontWeight: 600 }}>ADMIN</span>
        </div>
        <div className="admin-header-right" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/admin/calendar" style={{ fontSize: 14, color: brand.primary, textDecoration: 'none', fontWeight: 500, padding: '8px 16px', border: `1px solid ${brand.border}`, borderRadius: 6 }}>
            Calendar View
          </Link>
          <span style={{ fontSize: 14, color: brand.textLight }}>{user?.email}</span>
          <button onClick={handleLogout} style={{ ...buttonStyle, background: 'transparent', border: `1px solid ${brand.border}`, color: brand.text }}>Log Out</button>
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
          <Link href="/admin/calendar" onClick={() => setMobileMenuOpen(false)} style={{ padding: '14px 16px', fontSize: 16, fontWeight: 500, color: brand.primary, textDecoration: 'none', textAlign: 'center', borderRadius: 8, border: `1px solid ${brand.border}` }}>
            Calendar View
          </Link>
          <span style={{ padding: '14px 16px', fontSize: 14, color: brand.textLight, textAlign: 'center' }}>{user?.email}</span>
          <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{ padding: '14px 16px', fontSize: 16, fontWeight: 500, background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: 8, color: brand.text, cursor: 'pointer' }}>
            Log Out
          </button>
        </div>
      </header>

      <div className="admin-layout" style={{ display: 'flex' }}>
        <aside className="admin-sidebar" style={{ width: 220, background: brand.white, borderRight: `1px solid ${brand.border}`, minHeight: 'calc(100vh - 65px)', padding: '24px 0' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              display: 'block', width: '100%', padding: '12px 24px', textAlign: 'left',
              background: activeTab === tab.id ? brand.bg : 'transparent', border: 'none',
              borderLeft: activeTab === tab.id ? `3px solid ${brand.text}` : '3px solid transparent',
              fontSize: 15, fontWeight: activeTab === tab.id ? 600 : 400, color: brand.text, cursor: 'pointer'
            }}>
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="admin-main" style={{ flex: 1, padding: 32 }}>

          {crudError && (
            <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#DC2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{crudError}</span>
              <button onClick={() => setCrudError('')} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600, cursor: 'pointer', fontSize: 16 }}>&times;</button>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Bookings</h1>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} style={{ cursor: 'pointer' }} />
                    Show Cancelled
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showSkipped} onChange={(e) => setShowSkipped(e.target.checked)} style={{ cursor: 'pointer' }} />
                    Show Skipped
                  </label>
                </div>
              </div>
              <div className="table-wrapper">
                <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden', minWidth: 800 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: brand.bg }}>
                        {[
                          { field: 'customer_name', label: 'Customer' },
                          { field: 'building', label: 'Property' },
                          { field: 'booking_date', label: 'Date & Time' },
                          { field: 'total_price', label: 'Total' },
                          { field: 'status', label: 'Status' },
                          { field: 'worker_id', label: 'Worker' },
                        ].map(col => (
                          <th key={col.field} onClick={() => handleSort(col.field)} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight, cursor: 'pointer', userSelect: 'none' }}>
                            {col.label}{sortIndicator(col.field)}
                          </th>
                        ))}
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBookings.map(booking => {
                        const freqName = getFrequencyName(booking.frequency_id);
                        const statusStyle = getStatusStyle(booking.status);
                        const isRecurring = !!booking.recurring_group_id;
                        const isActionable = ['upcoming', 'scheduled'].includes(booking.status);

                        return (
                          <tr key={booking.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                            <td style={{ padding: '16px' }}>
                              <p style={{ fontWeight: 500, color: brand.text }}>{booking.customer_name}</p>
                              <p style={{ fontSize: 13, color: brand.textLight }}>{booking.customer_email}</p>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <p style={{ fontWeight: 500, color: brand.text }}>{booking.building}</p>
                              <p style={{ fontSize: 13, color: brand.textLight }}>Unit {booking.unit_number} · {booking.floor_plan}</p>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <p style={{ fontWeight: 500, color: brand.text }}>{formatDate(booking.booking_date)}</p>
                              <p style={{ fontSize: 13, color: brand.textLight }}>{booking.booking_time}</p>
                              {freqName && freqName !== 'One-Time' && (
                                <p style={{ fontSize: 12, color: brand.gold, fontWeight: 600 }}>{freqName}</p>
                              )}
                              {isRecurring && (
                                <p style={{ fontSize: 11, color: brand.textLight }}>Recurring group</p>
                              )}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ fontWeight: 600, color: brand.text }}>${booking.total_price}</span>
                              {booking.frequency_discount > 0 && (
                                <p style={{ fontSize: 11, color: brand.gold }}>-${booking.frequency_discount} freq.</p>
                              )}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 13, fontWeight: 500, ...statusStyle }}>
                                {booking.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px' }}>
                              <select
                                value={booking.worker_id || ''}
                                onChange={(e) => handleWorkerAssign(booking.id, e.target.value)}
                                style={{ ...inputStyle, width: 140, fontSize: 13 }}
                              >
                                <option value="">Unassigned</option>
                                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                              </select>
                            </td>
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                {isActionable && (
                                  <>
                                    <button onClick={() => handleMarkComplete(booking.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, fontSize: 12, padding: '6px 12px' }}>
                                      Complete
                                    </button>
                                    <button onClick={() => handleSkipBooking(booking.id)} style={{ ...buttonStyle, background: '#FEF3C7', color: '#92400E', fontSize: 12, padding: '6px 12px' }}>
                                      Skip
                                    </button>
                                    <button onClick={() => handleCancelBooking(booking.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger, fontSize: 12, padding: '6px 12px' }}>
                                      Cancel
                                    </button>
                                  </>
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
            </div>
          )}

          {/* CUSTOMERS TAB */}
          {activeTab === 'customers' && (() => {
            // Build unique customer list from bookings + user_profiles
            const customerMap = {};
            bookings.forEach(b => {
              const email = (b.customer_email || b.guest_email || '').toLowerCase().trim();
              if (!email) return;
              if (!customerMap[email]) {
                customerMap[email] = {
                  email,
                  name: b.customer_name || [b.guest_first_name, b.guest_last_name].filter(Boolean).join(' ') || '',
                  user_id: b.user_id || null,
                  bookings: [],
                  totalSpent: 0,
                  firstBooking: b.booking_date,
                  lastBooking: b.booking_date,
                };
              }
              const c = customerMap[email];
              c.bookings.push(b);
              if (!c.name && (b.customer_name || b.guest_first_name)) {
                c.name = b.customer_name || [b.guest_first_name, b.guest_last_name].filter(Boolean).join(' ');
              }
              if (!c.user_id && b.user_id) c.user_id = b.user_id;
              c.totalSpent += Number(b.total_price) || 0;
              if (b.booking_date < c.firstBooking) c.firstBooking = b.booking_date;
              if (b.booking_date > c.lastBooking) c.lastBooking = b.booking_date;
            });

            // Enrich with user_profiles data
            userProfiles.forEach(up => {
              const profileName = [up.first_name, up.last_name].filter(Boolean).join(' ');
              // Match by user_id
              Object.values(customerMap).forEach(c => {
                if (c.user_id && c.user_id === up.user_id) {
                  if (profileName && !c.name) c.name = profileName;
                  c.phone = c.phone || up.phone || '';
                  c.hasAccount = true;
                  c.accountCreated = up.created_at;
                }
              });
            });

            let customers = Object.values(customerMap);

            // Mark account holders
            customers.forEach(c => {
              if (c.user_id && !c.hasAccount) c.hasAccount = true;
              if (!c.hasAccount) c.hasAccount = false;
            });

            // Search filter
            const search = customerSearch.toLowerCase().trim();
            if (search) {
              customers = customers.filter(c =>
                (c.name || '').toLowerCase().includes(search) ||
                c.email.toLowerCase().includes(search) ||
                (c.phone || '').includes(search)
              );
            }

            // Sort by most recent booking
            customers.sort((a, b) => (b.lastBooking || '').localeCompare(a.lastBooking || ''));

            return (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Customers</h1>
                    <p style={{ fontSize: 14, color: brand.textLight, marginTop: 4 }}>{customers.length} customer{customers.length !== 1 ? 's' : ''} found</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={{ ...inputStyle, width: 280 }}
                  />
                </div>
                <div className="table-wrapper">
                  <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden', minWidth: 700 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ background: brand.bg }}>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight, width: 30 }}></th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Customer</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Account</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Bookings</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Total Spent</th>
                          <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Last Booking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(c => {
                          const isExpanded = expandedCustomer === c.email;
                          const completedCount = c.bookings.filter(b => b.status === 'completed').length;
                          const upcomingCount = c.bookings.filter(b => ['upcoming', 'scheduled'].includes(b.status)).length;
                          const cancelledCount = c.bookings.filter(b => b.status === 'cancelled').length;

                          return (
                            <React.Fragment key={c.email}>
                              <tr
                                onClick={() => setExpandedCustomer(isExpanded ? null : c.email)}
                                style={{ borderTop: `1px solid ${brand.border}`, cursor: 'pointer', background: isExpanded ? brand.bg : 'transparent' }}
                              >
                                <td style={{ padding: '16px 8px 16px 16px', fontSize: 14, color: brand.textLight }}>
                                  {isExpanded ? '▼' : '▶'}
                                </td>
                                <td style={{ padding: '16px' }}>
                                  <p style={{ fontWeight: 500, color: brand.text }}>{c.name || 'Unknown'}</p>
                                  <p style={{ fontSize: 13, color: brand.textLight }}>{c.email}</p>
                                  {c.phone && <p style={{ fontSize: 12, color: brand.textLight }}>{c.phone}</p>}
                                </td>
                                <td style={{ padding: '16px' }}>
                                  <span style={{
                                    padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                                    background: c.hasAccount ? '#DBEAFE' : '#f3f4f6',
                                    color: c.hasAccount ? '#1E40AF' : brand.textLight
                                  }}>
                                    {c.hasAccount ? 'Registered' : 'Guest'}
                                  </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                  <span style={{ fontWeight: 600, color: brand.text }}>{c.bookings.length}</span>
                                  <span style={{ fontSize: 12, color: brand.textLight, marginLeft: 6 }}>
                                    ({upcomingCount} upcoming, {completedCount} done{cancelledCount > 0 ? `, ${cancelledCount} cancelled` : ''})
                                  </span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                  <span style={{ fontWeight: 600, color: brand.text }}>${c.totalSpent.toFixed(2)}</span>
                                </td>
                                <td style={{ padding: '16px' }}>
                                  <span style={{ color: brand.text }}>{formatDate(c.lastBooking)}</span>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={6} style={{ padding: 0 }}>
                                    <div style={{ padding: '0 16px 16px 48px', background: brand.bg }}>

                                      {/* Customer Info Section */}
                                      <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, padding: 16, marginBottom: 16, marginTop: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                          <p style={{ fontSize: 14, fontWeight: 600, color: brand.text }}>Customer Info</p>
                                          {editingCustomerEmail === c.email ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                              <button onClick={() => handleSaveCustomerInfo(c.email, c.bookings, c.user_id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, fontSize: 12, padding: '6px 12px' }}>Save</button>
                                              <button onClick={() => { setEditingCustomerEmail(null); setEditingCustomerValue({}); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, fontSize: 12, padding: '6px 12px', border: `1px solid ${brand.border}` }}>Cancel</button>
                                            </div>
                                          ) : (
                                            <button onClick={() => { setEditingCustomerEmail(c.email); setEditingCustomerValue({ customer_name: c.name || '', customer_email: c.email, phone: c.phone || '' }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, fontSize: 12, padding: '6px 12px', border: `1px solid ${brand.border}` }}>Edit</button>
                                          )}
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                          <div>
                                            <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Name</label>
                                            {editingCustomerEmail === c.email ? (
                                              <input style={{ ...inputStyle, fontSize: 13 }} value={editingCustomerValue.customer_name || ''} onChange={(e) => setEditingCustomerValue({ ...editingCustomerValue, customer_name: e.target.value })} />
                                            ) : (
                                              <p style={{ fontSize: 14, color: brand.text, fontWeight: 500 }}>{c.name || 'Unknown'}</p>
                                            )}
                                          </div>
                                          <div>
                                            <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Email</label>
                                            {editingCustomerEmail === c.email ? (
                                              <input style={{ ...inputStyle, fontSize: 13 }} value={editingCustomerValue.customer_email || ''} onChange={(e) => setEditingCustomerValue({ ...editingCustomerValue, customer_email: e.target.value })} />
                                            ) : (
                                              <p style={{ fontSize: 14, color: brand.text }}>{c.email}</p>
                                            )}
                                          </div>
                                          <div>
                                            <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Phone</label>
                                            {editingCustomerEmail === c.email ? (
                                              <input style={{ ...inputStyle, fontSize: 13 }} value={editingCustomerValue.phone || ''} onChange={(e) => setEditingCustomerValue({ ...editingCustomerValue, phone: e.target.value })} placeholder="Enter phone..." />
                                            ) : (
                                              <p style={{ fontSize: 14, color: c.phone ? brand.text : brand.textLight }}>{c.phone || 'Not provided'}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Bookings Table */}
                                      <p style={{ fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 12 }}>
                                        Booking History ({c.bookings.length})
                                      </p>
                                      <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                          <thead>
                                            <tr style={{ background: '#f9fafb' }}>
                                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: brand.textLight }}>Date & Time</th>
                                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: brand.textLight }}>Property</th>
                                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: brand.textLight }}>Frequency</th>
                                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: brand.textLight }}>Total</th>
                                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: brand.textLight }}>Status</th>
                                              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: brand.textLight }}>Worker</th>
                                              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 12, fontWeight: 600, color: brand.textLight }}>Actions</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {c.bookings
                                              .sort((a, b) => (b.booking_date || '').localeCompare(a.booking_date || ''))
                                              .map(b => {
                                                const statusStyle = getStatusStyle(b.status);
                                                const freqName = getFrequencyName(b.frequency_id);
                                                const workerName = workers.find(w => w.id === b.worker_id)?.name || '';
                                                const isEditing = editingBookingId === b.id;
                                                const isActionable = ['upcoming', 'scheduled'].includes(b.status);

                                                return (
                                                  <tr key={b.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                                                    <td style={{ padding: '10px 12px' }}>
                                                      {isEditing ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                          <input type="date" style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }} value={editingBookingValue.booking_date || ''} onChange={(e) => setEditingBookingValue({ ...editingBookingValue, booking_date: e.target.value })} />
                                                          <input type="text" style={{ ...inputStyle, fontSize: 12, padding: '6px 8px' }} value={editingBookingValue.booking_time || ''} onChange={(e) => setEditingBookingValue({ ...editingBookingValue, booking_time: e.target.value })} placeholder="e.g. 9:00 AM" />
                                                        </div>
                                                      ) : (
                                                        <>
                                                          <p style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{formatDate(b.booking_date)}</p>
                                                          <p style={{ fontSize: 12, color: brand.textLight }}>{b.booking_time}</p>
                                                        </>
                                                      )}
                                                    </td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                      {isEditing ? (
                                                        <div>
                                                          <p style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{b.building}</p>
                                                          <input style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', marginTop: 4 }} value={editingBookingValue.unit_number || ''} onChange={(e) => setEditingBookingValue({ ...editingBookingValue, unit_number: e.target.value })} placeholder="Unit #" />
                                                        </div>
                                                      ) : (
                                                        <>
                                                          <p style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{b.building}</p>
                                                          <p style={{ fontSize: 12, color: brand.textLight }}>Unit {b.unit_number} · {b.floor_plan}</p>
                                                        </>
                                                      )}
                                                    </td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                      {freqName && freqName !== 'One-Time' ? (
                                                        <span style={{ fontSize: 12, color: brand.gold, fontWeight: 600 }}>{freqName}</span>
                                                      ) : (
                                                        <span style={{ fontSize: 12, color: brand.textLight }}>One-Time</span>
                                                      )}
                                                    </td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                      <span style={{ fontWeight: 600, color: brand.text, fontSize: 13 }}>${b.total_price}</span>
                                                    </td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                      <span style={{ padding: '3px 8px', borderRadius: 100, fontSize: 12, fontWeight: 500, ...statusStyle }}>
                                                        {b.status}
                                                      </span>
                                                    </td>
                                                    <td style={{ padding: '10px 12px' }}>
                                                      {isEditing ? (
                                                        <select style={{ ...inputStyle, fontSize: 12, padding: '6px 8px', width: 120 }} value={editingBookingValue.worker_id || ''} onChange={(e) => setEditingBookingValue({ ...editingBookingValue, worker_id: e.target.value })}>
                                                          <option value="">Unassigned</option>
                                                          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                                        </select>
                                                      ) : (
                                                        <span style={{ fontSize: 13, color: workerName ? brand.text : brand.textLight }}>{workerName || 'Unassigned'}</span>
                                                      )}
                                                    </td>
                                                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                                                      <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                        {isEditing ? (
                                                          <>
                                                            <button onClick={() => handleSaveBookingEdit(b.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, fontSize: 11, padding: '5px 10px' }}>Save</button>
                                                            <button onClick={() => { setEditingBookingId(null); setEditingBookingValue({}); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, fontSize: 11, padding: '5px 10px', border: `1px solid ${brand.border}` }}>Cancel</button>
                                                          </>
                                                        ) : (
                                                          <>
                                                            <button onClick={(e) => { e.stopPropagation(); setEditingBookingId(b.id); setEditingBookingValue({ booking_date: b.booking_date, booking_time: b.booking_time || '', worker_id: b.worker_id || '', unit_number: b.unit_number || '', special_instructions: b.special_instructions || '' }); }} style={{ ...buttonStyle, background: brand.primary, color: brand.text, fontSize: 11, padding: '5px 10px' }}>Edit</button>
                                                            {isActionable && (
                                                              <>
                                                                <button onClick={(e) => { e.stopPropagation(); handleMarkComplete(b.id); }} style={{ ...buttonStyle, background: brand.success, color: brand.white, fontSize: 11, padding: '5px 10px' }}>Complete</button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleSkipBooking(b.id); }} style={{ ...buttonStyle, background: '#FEF3C7', color: '#92400E', fontSize: 11, padding: '5px 10px' }}>Skip</button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleCancelBooking(b.id); }} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger, fontSize: 11, padding: '5px 10px' }}>Cancel</button>
                                                              </>
                                                            )}
                                                          </>
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
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                        {customers.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: brand.textLight }}>
                              {customerSearch ? 'No customers match your search.' : 'No customers found.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* FREQUENCIES TAB */}
          {activeTab === 'frequencies' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Frequencies</h1>
                <button onClick={() => handleAdd('frequencies')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>+ Add Frequency</button>
              </div>
              <div className="table-wrapper">
                <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: brand.bg }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Discount %</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Interval (days)</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Sort Order</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {frequencies.map(f => (
                        <tr key={f.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                          <td style={{ padding: '16px' }}>
                            {editingId === `frequency-${f.id}` ? (
                              <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: 500, color: brand.text }}>{f.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `frequency-${f.id}` ? (
                              <input style={{ ...inputStyle, width: 100 }} type="number" value={editValue.discount_percent ?? 0} onChange={(e) => setEditValue({ ...editValue, discount_percent: Number(e.target.value) })} />
                            ) : (
                              <span style={{ fontWeight: 600, color: Number(f.discount_percent) > 0 ? brand.gold : brand.text }}>{f.discount_percent}%</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `frequency-${f.id}` ? (
                              <input style={{ ...inputStyle, width: 100 }} type="number" value={editValue.interval_days ?? 0} onChange={(e) => setEditValue({ ...editValue, interval_days: Number(e.target.value) })} />
                            ) : (
                              <span style={{ color: brand.text }}>{f.interval_days} days</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `frequency-${f.id}` ? (
                              <input style={{ ...inputStyle, width: 80 }} type="number" value={editValue.sort_order ?? 0} onChange={(e) => setEditValue({ ...editValue, sort_order: Number(e.target.value) })} />
                            ) : (
                              <span style={{ color: brand.textLight }}>{f.sort_order}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `frequency-${f.id}` ? (
                              <button onClick={() => handleSave('frequencies', f.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`frequency-${f.id}`); setEditValue({ name: f.name, discount_percent: f.discount_percent, interval_days: f.interval_days, sort_order: f.sort_order }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                            )}
                            <button onClick={() => handleDelete('frequencies', f.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NEIGHBORHOODS TAB */}
          {activeTab === 'neighborhoods' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Neighborhoods</h1>
                <button onClick={() => handleAdd('neighborhoods')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>+ Add Neighborhood</button>
              </div>
              <div className="table-wrapper">
                <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: brand.bg }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Buildings</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {neighborhoods.map(n => (
                        <tr key={n.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                          <td style={{ padding: '16px' }}>
                            {editingId === `neighborhood-${n.id}` ? (
                              <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: 500, color: brand.text }}>{n.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', color: brand.textLight }}>{buildings.filter(b => b.neighborhood_id === n.id).length} buildings</td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `neighborhood-${n.id}` ? (
                              <button onClick={() => handleSave('neighborhoods', n.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`neighborhood-${n.id}`); setEditValue({ name: n.name }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                            )}
                            <button onClick={() => handleDelete('neighborhoods', n.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BUILDINGS TAB */}
          {activeTab === 'buildings' && (
            <div>
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Buildings</h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12 }}>
                  <select value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} style={{ ...inputStyle, width: 180 }}>
                    <option value="">All Neighborhoods</option>
                    {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                  <button onClick={() => handleAdd('buildings')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>+ Add Building</button>
                </div>
              </div>
              <div className="table-wrapper">
                <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: brand.bg }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Address</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Neighborhood</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBuildings.map(b => (
                        <tr key={b.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                          <td style={{ padding: '16px' }}>
                            {editingId === `building-${b.id}` ? (
                              <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: 500, color: brand.text }}>{b.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `building-${b.id}` ? (
                              <input style={inputStyle} value={editValue.address || ''} onChange={(e) => setEditValue({ ...editValue, address: e.target.value })} />
                            ) : (
                              <span style={{ color: brand.textLight }}>{b.address}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `building-${b.id}` ? (
                              <select style={inputStyle} value={editValue.neighborhood_id || ''} onChange={(e) => setEditValue({ ...editValue, neighborhood_id: e.target.value })}>
                                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                              </select>
                            ) : (
                              <span style={{ color: brand.textLight }}>{neighborhoods.find(n => n.id === b.neighborhood_id)?.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `building-${b.id}` ? (
                              <button onClick={() => handleSave('buildings', b.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`building-${b.id}`); setEditValue({ name: b.name, address: b.address, neighborhood_id: b.neighborhood_id }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                            )}
                            <button onClick={() => handleDelete('buildings', b.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* FLOOR PLANS TAB */}
          {activeTab === 'floorplans' && (
            <div>
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Floor Plans</h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12 }}>
                  <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} style={{ ...inputStyle, width: 200 }}>
                    <option value="">All Buildings</option>
                    {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <button onClick={() => handleAdd('floorplans')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>+ Add Floor Plan</button>
                </div>
              </div>
              <div className="table-wrapper">
                <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: brand.bg }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Building</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Price</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFloorPlans.map(f => (
                        <tr key={f.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                          <td style={{ padding: '16px' }}>
                            {editingId === `floorplan-${f.id}` ? (
                              <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: 500, color: brand.text }}>{f.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `floorplan-${f.id}` ? (
                              <select style={inputStyle} value={editValue.building_id || ''} onChange={(e) => setEditValue({ ...editValue, building_id: e.target.value })}>
                                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                              </select>
                            ) : (
                              <span style={{ color: brand.textLight }}>{buildings.find(b => b.id === f.building_id)?.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `floorplan-${f.id}` ? (
                              <input style={{ ...inputStyle, width: 100 }} type="number" value={editValue.price || 0} onChange={(e) => setEditValue({ ...editValue, price: Number(e.target.value) })} />
                            ) : (
                              <span style={{ fontWeight: 600, color: brand.text }}>${f.price}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `floorplan-${f.id}` ? (
                              <button onClick={() => handleSave('floorplans', f.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`floorplan-${f.id}`); setEditValue({ name: f.name, price: f.price, building_id: f.building_id }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                            )}
                            <button onClick={() => handleDelete('floorplans', f.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ADD-ONS TAB */}
          {activeTab === 'addons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Add-Ons</h1>
                <button onClick={() => handleAdd('addons')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>+ Add Add-On</button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderRadius: 8, border: `1px solid ${brand.border}`, background: brand.bg, marginBottom: 16 }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: brand.text }}>Add-Ons section on booking page</span>
                  <p style={{ fontSize: 13, color: brand.textLight, margin: '2px 0 0' }}>
                    {addonsSectionVisible ? 'Customers can see and select add-ons when booking' : 'The entire add-ons section is hidden from the booking page'}
                  </p>
                </div>
                <button onClick={handleToggleAddonsSection} style={{
                  ...buttonStyle,
                  background: addonsSectionVisible ? '#dcfce7' : '#fee2e2',
                  color: addonsSectionVisible ? '#16a34a' : brand.danger,
                  fontWeight: 600,
                }}>
                  {addonsSectionVisible ? 'Visible' : 'Hidden'}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <label style={{ fontSize: 14, color: brand.textLight, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={showArchivedAddOns} onChange={(e) => setShowArchivedAddOns(e.target.checked)} />
                  Show archived
                </label>
              </div>
              <div className="table-wrapper">
                <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: brand.bg }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Price</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addOns.filter(a => showArchivedAddOns || !a.archived).map(a => (
                        <tr key={a.id} style={{ borderTop: `1px solid ${brand.border}`, opacity: a.archived ? 0.6 : 1 }}>
                          <td style={{ padding: '16px' }}>
                            {editingId === `addon-${a.id}` ? (
                              <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: 500, color: brand.text }}>{a.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `addon-${a.id}` ? (
                              <input style={{ ...inputStyle, width: 100 }} type="number" value={editValue.price || 0} onChange={(e) => setEditValue({ ...editValue, price: Number(e.target.value) })} />
                            ) : (
                              <span style={{ fontWeight: 600, color: brand.text }}>${a.price}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span style={{
                              fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 12,
                              background: a.archived ? '#fee2e2' : '#dcfce7',
                              color: a.archived ? brand.danger : '#16a34a',
                            }}>
                              {a.archived ? 'Archived' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `addon-${a.id}` ? (
                              <button onClick={() => handleSave('addons', a.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`addon-${a.id}`); setEditValue({ name: a.name, price: a.price }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                            )}
                            <button onClick={() => handleToggleArchiveAddon(a.id, a.archived)} style={{ ...buttonStyle, background: a.archived ? '#dbeafe' : '#fef3c7', color: a.archived ? '#2563eb' : '#d97706', marginRight: 8 }}>
                              {a.archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button onClick={() => handleDelete('addons', a.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* WORKERS TAB */}
          {activeTab === 'workers' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Workers</h1>
                <button onClick={() => handleAdd('workers')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>+ Add Worker</button>
              </div>
              <div className="table-wrapper">
                <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: brand.bg }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Name</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Email</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Phone</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Assigned Jobs</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map(w => (
                        <tr key={w.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                          <td style={{ padding: '16px' }}>
                            {editingId === `worker-${w.id}` ? (
                              <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: 500, color: brand.text }}>{w.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `worker-${w.id}` ? (
                              <input style={inputStyle} value={editValue.email || ''} onChange={(e) => setEditValue({ ...editValue, email: e.target.value })} />
                            ) : (
                              <span style={{ color: brand.textLight }}>{w.email}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px' }}>
                            {editingId === `worker-${w.id}` ? (
                              <input style={inputStyle} value={editValue.phone || ''} onChange={(e) => setEditValue({ ...editValue, phone: e.target.value })} />
                            ) : (
                              <span style={{ color: brand.textLight }}>{w.phone}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', color: brand.textLight }}>
                            {bookings.filter(b => b.worker_id === w.id && b.status === 'upcoming').length} upcoming
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `worker-${w.id}` ? (
                              <button onClick={() => handleSave('workers', w.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`worker-${w.id}`); setEditValue({ name: w.name, email: w.email, phone: w.phone }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                            )}
                            <button onClick={() => handleDelete('workers', w.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === 'availability' && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text, marginBottom: 20 }}>Availability Management</h1>

              {/* Sub-tab navigation */}
              <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: `2px solid ${brand.border}` }}>
                {[
                  { id: 'weekly', label: 'Weekly Schedules' },
                  { id: 'blocked', label: 'Blocked Dates' },
                  { id: 'overrides', label: 'Schedule Overrides' },
                  { id: 'settings', label: 'Service Settings' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAvailabilitySubTab(tab.id)}
                    style={{
                      padding: '10px 20px', fontSize: 14, fontWeight: availabilitySubTab === tab.id ? 600 : 400,
                      color: availabilitySubTab === tab.id ? brand.text : brand.textLight,
                      background: 'transparent', border: 'none', cursor: 'pointer',
                      borderBottom: availabilitySubTab === tab.id ? `2px solid ${brand.text}` : '2px solid transparent',
                      marginBottom: -2,
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SUB-TAB 1: Weekly Schedules */}
              {availabilitySubTab === 'weekly' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <select
                      value={selectedWorkerAvail}
                      onChange={(e) => { setSelectedWorkerAvail(e.target.value); setEditingAvailability(null); }}
                      style={{ ...inputStyle, width: 240 }}
                    >
                      <option value="">Select a worker...</option>
                      {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                    </select>
                    {selectedWorkerAvail && !editingAvailability && (
                      <button
                        onClick={() => setEditingAvailability(getWorkerAvailability(selectedWorkerAvail))}
                        style={{ ...buttonStyle, background: brand.text, color: brand.white }}
                      >
                        Edit Schedule
                      </button>
                    )}
                  </div>

                  {!selectedWorkerAvail && (
                    <div>
                      <p style={{ fontSize: 14, color: brand.textLight, marginBottom: 20 }}>Select a worker to view/edit their schedule, or view all workers below.</p>
                      {/* All Workers Overview */}
                      <div className="table-wrapper">
                        <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: brand.bg }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Worker</th>
                                {DAY_NAMES.map(d => (
                                  <th key={d} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: brand.textLight }}>{d.slice(0, 3)}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {workers.map(w => {
                                const workerAvail = getWorkerAvailability(w.id);
                                return (
                                  <tr key={w.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                                    <td style={{ padding: '12px 16px', fontWeight: 500, color: brand.text }}>{w.name}</td>
                                    {workerAvail.map((day, idx) => (
                                      <td key={idx} style={{ padding: '8px', textAlign: 'center' }}>
                                        {day.is_active && !day.isNew ? (
                                          <div>
                                            <span style={{ fontSize: 11, color: brand.text, display: 'block' }}>{day.start_time?.slice(0, 5)}</span>
                                            <span style={{ fontSize: 10, color: brand.textLight }}>to</span>
                                            <span style={{ fontSize: 11, color: brand.text, display: 'block' }}>{day.end_time?.slice(0, 5)}</span>
                                          </div>
                                        ) : day.isNew ? (
                                          <span style={{ fontSize: 11, color: brand.textLight }}>--</span>
                                        ) : (
                                          <span style={{ fontSize: 11, color: brand.danger, fontWeight: 500 }}>Off</span>
                                        )}
                                      </td>
                                    ))}
                                  </tr>
                                );
                              })}
                              {workers.length === 0 && (
                                <tr><td colSpan={8} style={{ padding: 32, textAlign: 'center', color: brand.textLight }}>No workers found. Add workers first.</td></tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedWorkerAvail && !editingAvailability && (
                    <div className="table-wrapper">
                      <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ background: brand.bg }}>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Day</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Status</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Start Time</th>
                              <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>End Time</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getWorkerAvailability(selectedWorkerAvail).map((day, idx) => (
                              <tr key={idx} style={{ borderTop: `1px solid ${brand.border}` }}>
                                <td style={{ padding: '16px', fontWeight: 500, color: brand.text }}>{DAY_NAMES[idx]}</td>
                                <td style={{ padding: '16px' }}>
                                  {day.isNew ? (
                                    <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#f3f4f6', color: brand.textLight }}>Not set</span>
                                  ) : day.is_active ? (
                                    <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#dcfce7', color: '#16a34a' }}>Active</span>
                                  ) : (
                                    <span style={{ padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500, background: '#fee2e2', color: brand.danger }}>Off</span>
                                  )}
                                </td>
                                <td style={{ padding: '16px', color: day.is_active && !day.isNew ? brand.text : brand.textLight }}>{day.isNew ? '--' : day.start_time?.slice(0, 5)}</td>
                                <td style={{ padding: '16px', color: day.is_active && !day.isNew ? brand.text : brand.textLight }}>{day.isNew ? '--' : day.end_time?.slice(0, 5)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {editingAvailability && (
                    <div>
                      <div className="table-wrapper">
                        <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: brand.bg }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Day</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Active</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Start Time</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>End Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {editingAvailability.map((day, idx) => (
                                <tr key={idx} style={{ borderTop: `1px solid ${brand.border}`, opacity: day.is_active ? 1 : 0.5 }}>
                                  <td style={{ padding: '16px', fontWeight: 500, color: brand.text }}>{DAY_NAMES[idx]}</td>
                                  <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <input
                                      type="checkbox"
                                      checked={day.is_active}
                                      onChange={(e) => {
                                        const updated = [...editingAvailability];
                                        updated[idx] = { ...updated[idx], is_active: e.target.checked };
                                        setEditingAvailability(updated);
                                      }}
                                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                                    />
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <input
                                      type="time"
                                      value={day.start_time?.slice(0, 5) || '08:00'}
                                      onChange={(e) => {
                                        const updated = [...editingAvailability];
                                        updated[idx] = { ...updated[idx], start_time: e.target.value };
                                        setEditingAvailability(updated);
                                      }}
                                      disabled={!day.is_active}
                                      style={{ ...inputStyle, width: 140 }}
                                    />
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <input
                                      type="time"
                                      value={day.end_time?.slice(0, 5) || '17:00'}
                                      onChange={(e) => {
                                        const updated = [...editingAvailability];
                                        updated[idx] = { ...updated[idx], end_time: e.target.value };
                                        setEditingAvailability(updated);
                                      }}
                                      disabled={!day.is_active}
                                      style={{ ...inputStyle, width: 140 }}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button
                          onClick={() => handleSaveWeeklySchedule(selectedWorkerAvail)}
                          disabled={availSaving}
                          style={{ ...buttonStyle, background: brand.success, color: brand.white, opacity: availSaving ? 0.6 : 1 }}
                        >
                          {availSaving ? 'Saving...' : 'Save Schedule'}
                        </button>
                        <button
                          onClick={() => setEditingAvailability(null)}
                          style={{ ...buttonStyle, background: brand.bg, color: brand.text, border: `1px solid ${brand.border}` }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: Blocked Dates */}
              {availabilitySubTab === 'blocked' && (
                <div>
                  <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    {/* Left: Calendar + Form */}
                    <div style={{ flex: '1 1 400px', minWidth: 320 }}>
                      <div style={{ marginBottom: 16 }}>
                        <select
                          value={blockedDateForm.worker_id}
                          onChange={(e) => setBlockedDateForm({ ...blockedDateForm, worker_id: e.target.value })}
                          style={{ ...inputStyle, width: 240, marginBottom: 16 }}
                        >
                          <option value="">Select worker...</option>
                          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                      </div>

                      {/* Calendar */}
                      <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, padding: '6px 12px', border: `1px solid ${brand.border}` }}>&lt;</button>
                          <span style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>{MONTH_NAMES[calendarMonth]} {calendarYear}</span>
                          <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, padding: '6px 12px', border: `1px solid ${brand.border}` }}>&gt;</button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
                          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                            <div key={d} style={{ padding: '6px 0', textAlign: 'center', fontSize: 12, fontWeight: 600, color: brand.textLight }}>{d}</div>
                          ))}
                          {getCalendarDays(calendarYear, calendarMonth).map((day, i) => {
                            const dateStr = formatDateISO(day.date);
                            const workerBlocked = blockedDates.filter(bd => bd.blocked_date === dateStr && (!blockedDateForm.worker_id || bd.worker_id === blockedDateForm.worker_id));
                            const isBlocked = workerBlocked.length > 0;
                            const isSelected = blockedDateForm.blocked_date === dateStr;
                            const isToday = formatDateISO(new Date()) === dateStr;
                            return (
                              <button
                                key={i}
                                onClick={() => {
                                  if (blockedDateForm.worker_id) {
                                    setBlockedDateForm({ ...blockedDateForm, blocked_date: dateStr });
                                  }
                                }}
                                style={{
                                  padding: '8px 4px', textAlign: 'center', fontSize: 13, border: 'none', borderRadius: 4,
                                  cursor: blockedDateForm.worker_id ? 'pointer' : 'default',
                                  background: isSelected ? brand.primary : isBlocked ? '#fee2e2' : isToday ? '#DBEAFE' : 'transparent',
                                  color: day.isCurrentMonth ? (isBlocked ? brand.danger : brand.text) : '#ccc',
                                  fontWeight: isToday || isSelected ? 600 : 400,
                                }}
                              >
                                {day.date.getDate()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Add Blocked Date Form */}
                      {blockedDateForm.worker_id && blockedDateForm.blocked_date && (
                        <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, padding: 16 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 12 }}>
                            Block {formatDate(blockedDateForm.blocked_date)} for {workers.find(w => w.id === blockedDateForm.worker_id)?.name}
                          </p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                            <label style={{ fontSize: 13, color: brand.text, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={blockedDateForm.all_day}
                                onChange={(e) => setBlockedDateForm({ ...blockedDateForm, all_day: e.target.checked })}
                              />
                              All Day
                            </label>
                          </div>
                          {!blockedDateForm.all_day && (
                            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                              <div>
                                <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Start</label>
                                <input type="time" value={blockedDateForm.start_time} onChange={(e) => setBlockedDateForm({ ...blockedDateForm, start_time: e.target.value })} style={{ ...inputStyle, width: 140 }} />
                              </div>
                              <div>
                                <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>End</label>
                                <input type="time" value={blockedDateForm.end_time} onChange={(e) => setBlockedDateForm({ ...blockedDateForm, end_time: e.target.value })} style={{ ...inputStyle, width: 140 }} />
                              </div>
                            </div>
                          )}
                          <div style={{ marginBottom: 12 }}>
                            <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Reason (optional)</label>
                            <input
                              type="text"
                              value={blockedDateForm.reason}
                              onChange={(e) => setBlockedDateForm({ ...blockedDateForm, reason: e.target.value })}
                              placeholder="e.g. Vacation, Doctor's appointment..."
                              style={inputStyle}
                            />
                          </div>
                          <button onClick={handleAddBlockedDate} style={{ ...buttonStyle, background: brand.danger, color: brand.white }}>
                            Block This Date
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right: List of blocked dates */}
                    <div style={{ flex: '1 1 380px', minWidth: 300 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 12 }}>
                        Upcoming Blocked Dates
                      </p>
                      <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                        {blockedDates
                          .filter(bd => !blockedDateForm.worker_id || bd.worker_id === blockedDateForm.worker_id)
                          .filter(bd => bd.blocked_date >= formatDateISO(new Date()))
                          .sort((a, b) => a.blocked_date.localeCompare(b.blocked_date))
                          .map(bd => (
                            <div key={bd.id} style={{ padding: '12px 16px', borderBottom: `1px solid ${brand.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <p style={{ fontWeight: 500, color: brand.text, fontSize: 14 }}>
                                  {formatDate(bd.blocked_date)}
                                  <span style={{ fontSize: 12, color: brand.textLight, marginLeft: 8 }}>
                                    {workers.find(w => w.id === bd.worker_id)?.name}
                                  </span>
                                </p>
                                <p style={{ fontSize: 12, color: brand.textLight }}>
                                  {bd.all_day ? 'All day' : `${bd.start_time?.slice(0, 5)} - ${bd.end_time?.slice(0, 5)}`}
                                  {bd.reason && ` · ${bd.reason}`}
                                </p>
                              </div>
                              <button onClick={() => handleDeleteBlockedDate(bd.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger, fontSize: 12, padding: '6px 10px' }}>
                                Delete
                              </button>
                            </div>
                          ))}
                        {blockedDates.filter(bd => !blockedDateForm.worker_id || bd.worker_id === blockedDateForm.worker_id).filter(bd => bd.blocked_date >= formatDateISO(new Date())).length === 0 && (
                          <div style={{ padding: 24, textAlign: 'center', color: brand.textLight, fontSize: 14 }}>
                            No upcoming blocked dates.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 3: Schedule Overrides */}
              {availabilitySubTab === 'overrides' && (
                <div>
                  {/* Add Override Form */}
                  <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, padding: 20, marginBottom: 24 }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: brand.text, marginBottom: 16 }}>Add Schedule Override</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                      <div>
                        <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Worker</label>
                        <select value={overrideForm.worker_id} onChange={(e) => setOverrideForm({ ...overrideForm, worker_id: e.target.value })} style={inputStyle}>
                          <option value="">Select worker...</option>
                          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Date</label>
                        <input type="date" value={overrideForm.override_date} onChange={(e) => setOverrideForm({ ...overrideForm, override_date: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Start Time</label>
                        <input type="time" value={overrideForm.start_time} onChange={(e) => setOverrideForm({ ...overrideForm, start_time: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>End Time</label>
                        <input type="time" value={overrideForm.end_time} onChange={(e) => setOverrideForm({ ...overrideForm, end_time: e.target.value })} style={inputStyle} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Status</label>
                        <select value={overrideForm.is_available ? 'available' : 'unavailable'} onChange={(e) => setOverrideForm({ ...overrideForm, is_available: e.target.value === 'available' })} style={inputStyle}>
                          <option value="available">Available</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: brand.textLight, display: 'block', marginBottom: 4 }}>Reason</label>
                        <input type="text" value={overrideForm.reason} onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })} placeholder="e.g. Working Saturday" style={inputStyle} />
                      </div>
                    </div>
                    <button onClick={handleAddOverride} style={{ ...buttonStyle, background: brand.text, color: brand.white, marginTop: 16 }}>
                      + Add Override
                    </button>
                  </div>

                  {/* Overrides List */}
                  <div className="table-wrapper">
                    <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: brand.bg }}>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Worker</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Date</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Hours</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Status</th>
                            <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Reason</th>
                            <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduleOverrides
                            .sort((a, b) => a.override_date.localeCompare(b.override_date))
                            .map(so => (
                              <tr key={so.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                                <td style={{ padding: '16px', fontWeight: 500, color: brand.text }}>
                                  {workers.find(w => w.id === so.worker_id)?.name || 'Unknown'}
                                </td>
                                <td style={{ padding: '16px', color: brand.text }}>{formatDate(so.override_date)}</td>
                                <td style={{ padding: '16px', color: brand.text }}>{so.start_time?.slice(0, 5)} - {so.end_time?.slice(0, 5)}</td>
                                <td style={{ padding: '16px' }}>
                                  <span style={{
                                    padding: '4px 10px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                                    background: so.is_available ? '#dcfce7' : '#fee2e2',
                                    color: so.is_available ? '#16a34a' : brand.danger,
                                  }}>
                                    {so.is_available ? 'Available' : 'Unavailable'}
                                  </span>
                                </td>
                                <td style={{ padding: '16px', color: brand.textLight, fontSize: 13 }}>{so.reason || '--'}</td>
                                <td style={{ padding: '16px', textAlign: 'right' }}>
                                  <button onClick={() => handleDeleteOverride(so.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger, fontSize: 12, padding: '6px 12px' }}>
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          {scheduleOverrides.length === 0 && (
                            <tr><td colSpan={6} style={{ padding: 32, textAlign: 'center', color: brand.textLight }}>No schedule overrides.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* SUB-TAB 4: Service Settings */}
              {availabilitySubTab === 'settings' && (
                <div>
                  <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, padding: 24, maxWidth: 600 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <p style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>Scheduling Configuration</p>
                      {!editingSettings ? (
                        <button
                          onClick={() => setEditingSettings({ ...serviceSettings })}
                          style={{ ...buttonStyle, background: brand.bg, color: brand.text, border: `1px solid ${brand.border}` }}
                        >
                          Edit
                        </button>
                      ) : (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={handleSaveServiceSettings} disabled={availSaving} style={{ ...buttonStyle, background: brand.success, color: brand.white, opacity: availSaving ? 0.6 : 1 }}>
                            {availSaving ? 'Saving...' : 'Save'}
                          </button>
                          <button onClick={() => setEditingSettings(null)} style={{ ...buttonStyle, background: brand.bg, color: brand.text, border: `1px solid ${brand.border}` }}>Cancel</button>
                        </div>
                      )}
                    </div>
                    {[
                      { key: 'slot_duration_minutes', label: 'Slot Duration', unit: 'minutes', description: 'Length of each booking time slot' },
                      { key: 'buffer_between_jobs_minutes', label: 'Buffer Between Jobs', unit: 'minutes', description: 'Break time between consecutive bookings' },
                      { key: 'max_bookings_per_slot', label: 'Max Bookings Per Slot', unit: '', description: 'Maximum number of bookings allowed in a single time slot' },
                      { key: 'advance_booking_days', label: 'Advance Booking Days', unit: 'days', description: 'How far in advance customers can book' },
                      { key: 'minimum_notice_hours', label: 'Minimum Notice', unit: 'hours', description: 'Minimum hours before a booking can be made' },
                    ].map(setting => (
                      <div key={setting.key} style={{ padding: '16px 0', borderBottom: `1px solid ${brand.border}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ fontSize: 14, fontWeight: 500, color: brand.text }}>{setting.label}</p>
                            <p style={{ fontSize: 12, color: brand.textLight, marginTop: 2 }}>{setting.description}</p>
                          </div>
                          {editingSettings ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <input
                                type="number"
                                value={editingSettings[setting.key] || ''}
                                onChange={(e) => setEditingSettings({ ...editingSettings, [setting.key]: e.target.value })}
                                style={{ ...inputStyle, width: 80, textAlign: 'center' }}
                                min="0"
                              />
                              {setting.unit && <span style={{ fontSize: 13, color: brand.textLight }}>{setting.unit}</span>}
                            </div>
                          ) : (
                            <span style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>
                              {serviceSettings[setting.key] || '--'}{setting.unit ? ` ${setting.unit}` : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
