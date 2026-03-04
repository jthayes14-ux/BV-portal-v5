'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/useAuth';

function Logo({ light }) {
  const c = light ? '#fff' : '#B8C5F2';
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      <div style={{ width: 4, height: 22, background: c, borderRadius: 2 }} />
      <div style={{ width: 4, height: 22, background: c, borderRadius: 2 }} />
      <div style={{ width: 4, height: 22, background: c, borderRadius: 2 }} />
    </div>
  );
}

// Sidebar icons (18x18 SVGs)
const SidebarIcon = ({ name }) => {
  const icons = {
    bookings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="m9 16 2 2 4-4"/></svg>,
    customers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    frequencies: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
    neighborhoods: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    buildings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><line x1="8" y1="6" x2="8" y2="6.01"/><line x1="12" y1="6" x2="12" y2="6.01"/><line x1="16" y1="6" x2="16" y2="6.01"/><line x1="8" y1="10" x2="8" y2="10.01"/><line x1="12" y1="10" x2="12" y2="10.01"/><line x1="16" y1="10" x2="16" y2="10.01"/><line x1="8" y1="14" x2="8" y2="14.01"/><line x1="12" y1="14" x2="12" y2="14.01"/><line x1="16" y1="14" x2="16" y2="14.01"/></svg>,
    floorplans: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
    unitlines: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    addons: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
    workers: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
    availability: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    settings: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
    calendar: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    edit: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
    archive: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
    check: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    x: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  };
  return icons[name] || null;
};

// Sidebar group config
const sidebarGroups = [
  { label: 'Operations', items: ['bookings', 'customers', 'calendar'] },
  { label: 'Properties', items: ['buildings', 'neighborhoods', 'floorplans', 'unitlines'] },
  { label: 'Services', items: ['frequencies', 'addons'] },
  { label: 'Team', items: ['workers', 'availability'] },
  { label: 'System', items: ['settings'] },
];

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
  const [unitLines, setUnitLines] = useState([]);
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
  const [selectedBuildingUL, setSelectedBuildingUL] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sortField, setSortField] = useState('booking_date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showCancelled, setShowCancelled] = useState(false);
  const [showSkipped, setShowSkipped] = useState(false);
  const [showArchivedAddOns, setShowArchivedAddOns] = useState(false);
  const [showArchivedNeighborhoods, setShowArchivedNeighborhoods] = useState(false);
  const [showArchivedBuildings, setShowArchivedBuildings] = useState(false);
  const [showArchivedFloorPlans, setShowArchivedFloorPlans] = useState(false);
  const [showArchivedUnitLines, setShowArchivedUnitLines] = useState(false);
  const [showArchivedWorkers, setShowArchivedWorkers] = useState(false);
  const [showArchivedFrequencies, setShowArchivedFrequencies] = useState(false);
  const [addonsSectionVisible, setAddonsSectionVisible] = useState(true);

  // Search/filter state for tables
  const [searchNeighborhoods, setSearchNeighborhoods] = useState('');
  const [searchBuildings, setSearchBuildings] = useState('');
  const [searchFloorPlans, setSearchFloorPlans] = useState('');
  const [searchUnitLines, setSearchUnitLines] = useState('');
  const [searchAddOns, setSearchAddOns] = useState('');
  const [searchWorkers, setSearchWorkers] = useState('');
  const [searchFrequencies, setSearchFrequencies] = useState('');
  const [searchBookings, setSearchBookings] = useState('');

  // Collapsible section state for grouped views
  const [collapsedSections, setCollapsedSections] = useState({});
  const toggleSection = (key) => setCollapsedSections(prev => ({ ...prev, [key]: !prev[key] }));

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
  const [blockedDateForm, setBlockedDateForm] = useState({ worker_id: '', blocked_date: '', all_day: true, start_time: '09:00', end_time: '16:00', reason: '' });

  // Schedule overrides form
  const [overrideForm, setOverrideForm] = useState({ worker_id: '', override_date: '', start_time: '09:00', end_time: '16:00', is_available: true, reason: '' });

  // Service settings editing
  const [editingSettings, setEditingSettings] = useState(null);

  // Calendar state for blocked dates
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  const brand = {
    navy: '#1B2B5A', navyLight: '#243670', periwinkle: '#B8C5F2',
    primary: '#1B2B5A', text: '#1E293B', textLight: '#64748B',
    border: '#E2E8F0', bg: '#F8FAFC', white: '#ffffff',
    danger: '#EF4444', success: '#22C55E', warning: '#F59E0B',
    gold: '#1B2B5A', accent: '#B8C5F2',
  };

  const tabs = [
    { id: 'bookings', label: 'Bookings', icon: 'bookings' },
    { id: 'customers', label: 'Customers', icon: 'customers' },
    { id: 'frequencies', label: 'Frequencies', icon: 'frequencies' },
    { id: 'neighborhoods', label: 'Neighborhoods', icon: 'neighborhoods' },
    { id: 'buildings', label: 'Buildings', icon: 'buildings' },
    { id: 'floorplans', label: 'Floor Plans', icon: 'floorplans' },
    { id: 'unitlines', label: 'Unit Lines', icon: 'unitlines' },
    { id: 'addons', label: 'Add-Ons', icon: 'addons' },
    { id: 'workers', label: 'Workers', icon: 'workers' },
    { id: 'availability', label: 'Availability', icon: 'availability' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const HOUR_OPTIONS = [
    { value: '06:00', label: '6:00 AM' }, { value: '07:00', label: '7:00 AM' },
    { value: '08:00', label: '8:00 AM' }, { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' }, { value: '11:00', label: '11:00 AM' },
    { value: '12:00', label: '12:00 PM' }, { value: '13:00', label: '1:00 PM' },
    { value: '14:00', label: '2:00 PM' }, { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' }, { value: '17:00', label: '5:00 PM' },
    { value: '18:00', label: '6:00 PM' }, { value: '19:00', label: '7:00 PM' },
    { value: '20:00', label: '8:00 PM' },
  ];

  const SLOT_DURATION_OPTIONS = [
    { value: '60', label: '1 hour' }, { value: '120', label: '2 hours' },
    { value: '180', label: '3 hours' }, { value: '240', label: '4 hours' },
  ];

  const BUFFER_OPTIONS = [
    { value: '0', label: '0 minutes' }, { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' }, { value: '45', label: '45 minutes' },
    { value: '60', label: '1 hour' },
  ];

  const NOTICE_OPTIONS = [
    { value: '12', label: '12 hours' }, { value: '24', label: '24 hours' },
    { value: '48', label: '48 hours' }, { value: '72', label: '72 hours' },
  ];

  const ADVANCE_OPTIONS = [
    { value: '7', label: '1 week' }, { value: '14', label: '2 weeks' },
    { value: '30', label: '30 days' }, { value: '60', label: '60 days' },
    { value: '90', label: '90 days' },
  ];

  const buttonStyle = { padding: '7px 14px', fontSize: 13, fontWeight: 500, border: 'none', borderRadius: 6, cursor: 'pointer', transition: 'all 0.15s ease', display: 'inline-flex', alignItems: 'center', gap: 6 };
  const inputStyle = { padding: '8px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 6, width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: '#fff', transition: 'border-color 0.15s' };
  const iconBtnStyle = { ...buttonStyle, padding: '6px', borderRadius: 6, width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' };
  const thStyle = { padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: brand.textLight, textTransform: 'uppercase', letterSpacing: '0.05em' };
  const tdStyle = { padding: '12px 16px' };

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user && !ADMIN_EMAILS.includes(user.email?.toLowerCase())) { router.push('/dashboard'); return; }
    if (!authLoading && user) loadAll();
  }, [authLoading, user]);

  const loadAll = async () => {
    const [nRes, bRes, fpRes, ulRes, aoRes, bkRes, wRes, fqRes, upRes, avRes, bdRes, soRes, svcRes] = await Promise.all([
      supabase.from('neighborhoods').select('*').order('name'),
      supabase.from('buildings').select('*').order('name'),
      supabase.from('floor_plans').select('*').order('name'),
      supabase.from('unit_lines').select('*').order('line_number'),
      supabase.from('add_ons').select('*').order('name'),
      supabase.from('bookings').select('*').order('booking_date', { ascending: false }).limit(10000),
      supabase.from('workers').select('*').order('name'),
      supabase.from('frequencies').select('*').order('sort_order'),
      supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
      supabase.from('availability').select('*').order('day_of_week'),
      supabase.from('blocked_dates').select('*').order('blocked_date'),
      supabase.from('schedule_overrides').select('*').order('override_date'),
      supabase.from('site_settings').select('*'),
    ]);
    setNeighborhoods(nRes.data || []);
    setBuildings(bRes.data || []);
    setFloorPlans(fpRes.data || []);
    setUnitLines(ulRes.data || []);
    setAddOns(aoRes.data || []);
    setBookings(bkRes.data || []);
    setWorkers(wRes.data || []);
    setFrequencies(fqRes.data || []);
    setUserProfiles(upRes.data || []);
    setAvailability(avRes.data || []);
    setBlockedDates(bdRes.data || []);
    setScheduleOverrides(soRes.data || []);
    // Convert site_settings array to object for scheduling config
    const allSettings = svcRes.data || [];
    const addonVisible = allSettings.find(s => s.key === 'addons_section_visible');
    if (addonVisible) setAddonsSectionVisible(addonVisible.value === 'true');
    const settingsObj = {};
    allSettings.forEach(s => { settingsObj[s.key] = s.value; });
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
        result = await supabase.from('floor_plans').insert({ name: 'New Floor Plan', price: 0, duration_minutes: 60, building_id: buildings[0]?.id }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setFloorPlans([...floorPlans, result.data]); setEditingId(`floorplan-${result.data.id}`); setEditValue({ name: 'New Floor Plan', price: 0, duration_minutes: 60, building_id: buildings[0]?.id }); }
        break;
      case 'unitlines': {
        const defaultBuilding = selectedBuildingUL || buildings[0]?.id;
        const buildingPlans = floorPlans.filter(fp => fp.building_id === defaultBuilding && !fp.archived);
        result = await supabase.from('unit_lines').insert({ building_id: defaultBuilding, line_number: '01', floor_min: 1, floor_max: 99, floor_plan_id: buildingPlans[0]?.id || null, custom_price: null }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setUnitLines([...unitLines, result.data]); setEditingId(`unitline-${result.data.id}`); setEditValue({ building_id: result.data.building_id, line_number: result.data.line_number, floor_min: result.data.floor_min, floor_max: result.data.floor_max, floor_plan_id: result.data.floor_plan_id || '', custom_price: result.data.custom_price || '' }); }
        break;
      }
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

  const handleAddFloorPlanToBuilding = async (buildingId) => {
    setCrudError('');
    const result = await supabase.from('floor_plans').insert({ name: 'New Floor Plan', price: 0, duration_minutes: 60, building_id: buildingId }).select().single();
    if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
    if (result.data) { setFloorPlans([...floorPlans, result.data]); setEditingId(`floorplan-${result.data.id}`); setEditValue({ name: 'New Floor Plan', price: 0, duration_minutes: 60, building_id: buildingId }); }
  };

  const handleAddUnitLineToBuilding = async (buildingId) => {
    setCrudError('');
    const buildingPlans = floorPlans.filter(fp => fp.building_id === buildingId && !fp.archived);
    const result = await supabase.from('unit_lines').insert({ building_id: buildingId, line_number: '01', floor_min: 1, floor_max: 99, floor_plan_id: buildingPlans[0]?.id || null, custom_price: null }).select().single();
    if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
    if (result.data) { setUnitLines([...unitLines, result.data]); setEditingId(`unitline-${result.data.id}`); setEditValue({ building_id: result.data.building_id, line_number: result.data.line_number, floor_min: result.data.floor_min, floor_max: result.data.floor_max, floor_plan_id: result.data.floor_plan_id || '', custom_price: result.data.custom_price ?? '' }); }
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
      case 'unitlines': {
        const payload = { ...editValue, custom_price: editValue.custom_price === '' || editValue.custom_price === null ? null : Number(editValue.custom_price), floor_plan_id: editValue.floor_plan_id ? Number(editValue.floor_plan_id) : null };
        result = await supabase.from('unit_lines').update(payload).eq('id', id);
        break;
      }
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
      case 'unitlines': {
        const saved = { ...editValue, custom_price: editValue.custom_price === '' || editValue.custom_price === null ? null : Number(editValue.custom_price), floor_plan_id: editValue.floor_plan_id || null };
        setUnitLines(unitLines.map(ul => ul.id === id ? { ...ul, ...saved } : ul));
        break;
      }
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
    const tableMap = { neighborhoods: 'neighborhoods', buildings: 'buildings', floorplans: 'floor_plans', unitlines: 'unit_lines', addons: 'add_ons', workers: 'workers', frequencies: 'frequencies' };
    const { error: deleteError } = await supabase.from(tableMap[type]).delete().eq('id', id);
    if (deleteError) {
      setCrudError('Failed to delete: ' + deleteError.message);
      return;
    }
    switch (type) {
      case 'neighborhoods': setNeighborhoods(neighborhoods.filter(n => n.id !== id)); break;
      case 'buildings': setBuildings(buildings.filter(b => b.id !== id)); break;
      case 'floorplans': setFloorPlans(floorPlans.filter(f => f.id !== id)); break;
      case 'unitlines': setUnitLines(unitLines.filter(ul => ul.id !== id)); break;
      case 'addons': setAddOns(addOns.filter(a => a.id !== id)); break;
      case 'workers': setWorkers(workers.filter(w => w.id !== id)); break;
      case 'frequencies': setFrequencies(frequencies.filter(f => f.id !== id)); break;
    }
  };

  const handleToggleArchive = async (type, id, currentArchived) => {
    setCrudError('');
    const newArchived = !currentArchived;
    const tableMap = { neighborhoods: 'neighborhoods', buildings: 'buildings', floorplans: 'floor_plans', unitlines: 'unit_lines', addons: 'add_ons', workers: 'workers', frequencies: 'frequencies' };
    const { error } = await supabase.from(tableMap[type]).update({ archived: newArchived }).eq('id', id);
    if (error) { setCrudError('Failed to update: ' + error.message); return; }
    const setterMap = {
      neighborhoods: [neighborhoods, setNeighborhoods],
      buildings: [buildings, setBuildings],
      floorplans: [floorPlans, setFloorPlans],
      unitlines: [unitLines, setUnitLines],
      addons: [addOns, setAddOns],
      workers: [workers, setWorkers],
      frequencies: [frequencies, setFrequencies],
    };
    const [items, setter] = setterMap[type];
    setter(items.map(item => item.id === id ? { ...item, archived: newArchived } : item));
  };

  const handleToggleAddonsSection = async () => {
    const newValue = !addonsSectionVisible;
    const { error } = await supabase.from('site_settings').upsert({ key: 'addons_section_visible', value: String(newValue) }, { onConflict: 'key' });
    if (error) { setCrudError('Failed to update setting: ' + error.message); return; }
    setAddonsSectionVisible(newValue);
  };

  // === Availability Management Handlers ===

  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const getWorkerAvailability = (workerId) => {
    return DAY_NAMES.map((_, idx) => {
      const existing = availability.find(a => a.worker_id === workerId && a.day_of_week === idx);
      return existing || { worker_id: workerId, day_of_week: idx, start_time: '09:00', end_time: '16:00', is_active: true, isNew: true };
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
    setBlockedDateForm({ worker_id: blockedDateForm.worker_id, blocked_date: '', all_day: true, start_time: '09:00', end_time: '16:00', reason: '' });
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
    setOverrideForm({ worker_id: overrideForm.worker_id, override_date: '', start_time: '09:00', end_time: '16:00', is_available: true, reason: '' });
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
        const { error } = await supabase.from('site_settings').upsert({ key, value: String(value) }, { onConflict: 'key' });
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

  const [chargingBookingId, setChargingBookingId] = useState(null);

  const handleChargeBooking = async (bookingId) => {
    if (!confirm('Charge this booking now? The customer\'s saved card will be charged.')) return;
    setChargingBookingId(bookingId);
    try {
      const res = await fetch('/api/charge-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const data = await res.json();
      if (res.ok && data.payment_status === 'paid') {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, payment_status: 'paid' } : b));
      } else {
        setBookings(bookings.map(b => b.id === bookingId ? { ...b, payment_status: 'failed' } : b));
        alert('Charge failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('Charge failed: ' + err.message);
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, payment_status: 'failed' } : b));
    }
    setChargingBookingId(null);
  };

  const getPaymentStatusStyle = (status) => {
    switch (status) {
      case 'paid': return { background: '#D1FAE5', color: '#065F46' };
      case 'failed': return { background: '#FEE2E2', color: '#DC2626' };
      case 'pending': return { background: '#FEF3C7', color: '#92400E' };
      default: return { background: '#F3F4F6', color: '#6B7280' };
    }
  };

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
    if (searchBookings) {
      const s = searchBookings.toLowerCase();
      const workerName = (workers.find(w => w.id === b.worker_id)?.name || '').toLowerCase();
      if (
        !(b.customer_name || '').toLowerCase().includes(s) &&
        !(b.customer_email || '').toLowerCase().includes(s) &&
        !(b.building || '').toLowerCase().includes(s) &&
        !(b.unit_number || '').toLowerCase().includes(s) &&
        !(b.status || '').toLowerCase().includes(s) &&
        !workerName.includes(s)
      ) return false;
    }
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
      case 'payment_status':
        aVal = (a.payment_status || '').toLowerCase();
        bVal = (b.payment_status || '').toLowerCase();
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

  const filteredNeighborhoods = neighborhoods.filter(n => {
    if (!showArchivedNeighborhoods && n.archived) return false;
    if (searchNeighborhoods && !(n.name || '').toLowerCase().includes(searchNeighborhoods.toLowerCase())) return false;
    return true;
  });
  const filteredBuildings = buildings.filter(b => {
    if (!showArchivedBuildings && b.archived) return false;
    if (selectedNeighborhood && String(b.neighborhood_id) !== String(selectedNeighborhood)) return false;
    if (searchBuildings) {
      const s = searchBuildings.toLowerCase();
      const nName = (neighborhoods.find(n => n.id === b.neighborhood_id)?.name || '').toLowerCase();
      if (!(b.name || '').toLowerCase().includes(s) && !(b.address || '').toLowerCase().includes(s) && !nName.includes(s)) return false;
    }
    return true;
  });
  const filteredFloorPlans = floorPlans.filter(f => {
    if (!showArchivedFloorPlans && f.archived) return false;
    if (!showArchivedFloorPlans) {
      const parentBuilding = buildings.find(b => b.id === f.building_id);
      if (parentBuilding && parentBuilding.archived) return false;
    }
    if (selectedBuilding && String(f.building_id) !== String(selectedBuilding)) return false;
    if (searchFloorPlans) {
      const s = searchFloorPlans.toLowerCase();
      const bName = (buildings.find(b => b.id === f.building_id)?.name || '').toLowerCase();
      if (!(f.name || '').toLowerCase().includes(s) && !bName.includes(s)) return false;
    }
    return true;
  });
  const filteredUnitLines = unitLines.filter(ul => {
    if (!showArchivedUnitLines && ul.archived) return false;
    if (!showArchivedUnitLines) {
      const parentBuilding = buildings.find(b => b.id === ul.building_id);
      if (parentBuilding && parentBuilding.archived) return false;
    }
    if (selectedBuildingUL && String(ul.building_id) !== String(selectedBuildingUL)) return false;
    if (searchUnitLines) {
      const s = searchUnitLines.toLowerCase();
      const bName = (buildings.find(b => b.id === ul.building_id)?.name || '').toLowerCase();
      const fpName = (floorPlans.find(f => f.id === ul.floor_plan_id)?.name || '').toLowerCase();
      if (!(ul.line_number || '').toLowerCase().includes(s) && !bName.includes(s) && !fpName.includes(s)) return false;
    }
    return true;
  });
  const filteredWorkers = workers.filter(w => {
    if (!showArchivedWorkers && w.archived) return false;
    if (searchWorkers) {
      const s = searchWorkers.toLowerCase();
      if (!(w.name || '').toLowerCase().includes(s) && !(w.email || '').toLowerCase().includes(s) && !(w.phone || '').toLowerCase().includes(s)) return false;
    }
    return true;
  });
  const filteredFrequenciesList = frequencies.filter(f => {
    if (!showArchivedFrequencies && f.archived) return false;
    if (searchFrequencies && !(f.name || '').toLowerCase().includes(searchFrequencies.toLowerCase())) return false;
    return true;
  });
  const filteredAddOnsList = addOns.filter(a => {
    if (!showArchivedAddOns && a.archived) return false;
    if (searchAddOns && !(a.name || '').toLowerCase().includes(searchAddOns.toLowerCase())) return false;
    return true;
  });

  const handleLogout = async () => { await signOut(); router.push('/login'); };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'upcoming': return { background: brand.navy, color: '#fff' };
      case 'scheduled': return { background: '#DBEAFE', color: '#1E40AF' };
      case 'completed': return { background: '#F0FDF4', color: '#16A34A' };
      case 'skipped': return { background: '#FFFBEB', color: '#D97706' };
      case 'cancelled': return { background: '#FEF2F2', color: '#DC2626' };
      default: return { background: '#F1F5F9', color: brand.textLight };
    }
  };

  if (authLoading || dataLoading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}><div style={{ textAlign: 'center' }}><div style={{ width: 36, height: 36, border: '3px solid #E2E8F0', borderTopColor: brand.navy, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} /><p style={{ color: brand.textLight, fontSize: 13, fontWeight: 500 }}>Loading admin...</p></div><style jsx global>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style></div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: brand.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>

      <div className="admin-layout" style={{ display: 'flex' }}>
        {/* Navy Sidebar */}
        <aside className="admin-sidebar" style={{ width: 240, background: brand.navy, minHeight: '100vh', padding: '0', position: 'sticky', top: 0, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column' }}>
          {/* Sidebar Header */}
          <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <Logo light />
              <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>BetterView</span>
              <span style={{ padding: '2px 6px', background: 'rgba(184,197,242,0.2)', color: brand.periwinkle, borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }}>ADMIN</span>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
            {sidebarGroups.map((group, gi) => (
              <div key={group.label} style={{ marginBottom: 4 }}>
                <div style={{ padding: '8px 20px 4px', fontSize: 10, fontWeight: 600, color: 'rgba(184,197,242,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {group.label}
                </div>
                {group.items.map(itemId => {
                  if (itemId === 'calendar') {
                    return (
                      <Link key="calendar" href="/admin/calendar" style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 20px',
                        textDecoration: 'none', fontSize: 13, fontWeight: 400,
                        color: 'rgba(255,255,255,0.6)', transition: 'all 0.15s ease',
                      }}>
                        <SidebarIcon name="calendar" />
                        <span>Calendar</span>
                      </Link>
                    );
                  }
                  const tab = tabs.find(t => t.id === itemId);
                  if (!tab) return null;
                  const isActive = activeTab === tab.id;
                  return (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 20px',
                      textAlign: 'left', border: 'none',
                      background: isActive ? 'rgba(255,255,255,0.12)' : 'transparent',
                      borderLeft: isActive ? '3px solid ' + brand.periwinkle : '3px solid transparent',
                      fontSize: 13, fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                    }}>
                      <SidebarIcon name={tab.icon} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
            <button onClick={handleLogout} style={{ ...buttonStyle, background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', width: '100%', justifyContent: 'center', fontSize: 12 }}>
              Log Out
            </button>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="admin-header" style={{ display: 'none', padding: '12px 16px', background: brand.navy, justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Logo light />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>BetterView</span>
          </div>

          <button className="mobile-nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 6, padding: 8, color: '#fff', cursor: 'pointer' }}>
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            )}
          </button>

          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`} style={{ background: brand.navy }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { setActiveTab(tab.id); setMobileMenuOpen(false); }} style={{
                padding: '12px 16px', fontSize: 14, fontWeight: activeTab === tab.id ? 600 : 400,
                background: activeTab === tab.id ? 'rgba(255,255,255,0.12)' : 'transparent',
                border: 'none', borderRadius: 8, color: activeTab === tab.id ? '#fff' : 'rgba(255,255,255,0.6)',
                cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <SidebarIcon name={tab.icon} />
                {tab.label}
              </button>
            ))}
            <Link href="/admin/calendar" onClick={() => setMobileMenuOpen(false)} style={{
              padding: '12px 16px', fontSize: 14, fontWeight: 400, color: 'rgba(255,255,255,0.6)',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <SidebarIcon name="calendar" />
              Calendar
            </Link>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0', padding: '12px 16px' }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{user?.email}</span>
            </div>
            <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} style={{
              padding: '12px 16px', fontSize: 14, fontWeight: 500, background: 'rgba(255,255,255,0.08)',
              border: 'none', borderRadius: 8, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', width: '100%', textAlign: 'center',
            }}>
              Log Out
            </button>
          </div>
        </header>

        <main className="admin-main" style={{ flex: 1, padding: '28px 32px', minHeight: '100vh' }}>

          {crudError && (
            <div style={{ padding: '10px 16px', background: '#FEF2F2', borderRadius: 8, marginBottom: 20, fontSize: 13, color: '#DC2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 500, border: '1px solid #FECACA' }}>
              <span>{crudError}</span>
              <button onClick={() => setCrudError('')} style={{ background: 'none', border: 'none', color: '#DC2626', fontWeight: 600, cursor: 'pointer', fontSize: 16, width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (() => {
            const today = new Date().toISOString().split('T')[0];
            const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];
            const todayBookings = bookings.filter(b => b.booking_date === today && !['cancelled', 'skipped'].includes(b.status));
            const weekBookings = bookings.filter(b => b.booking_date >= weekAgo && b.booking_date <= today);
            const weekRevenue = weekBookings.filter(b => b.payment_status === 'paid').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
            const upcomingCount = bookings.filter(b => ['upcoming', 'scheduled'].includes(b.status)).length;
            const pendingPayments = bookings.filter(b => b.payment_status === 'pending' && ['upcoming', 'scheduled'].includes(b.status)).length;

            return (
            <div>
              <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em', marginBottom: 4 }}>Bookings</h1>
                <p style={{ fontSize: 13, color: brand.textLight }}>{sortedBookings.length} booking{sortedBookings.length !== 1 ? 's' : ''} total</p>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Today's Bookings", value: todayBookings.length, sub: today },
                  { label: 'Upcoming', value: upcomingCount, sub: 'Scheduled jobs' },
                  { label: 'Week Revenue', value: `$${weekRevenue.toFixed(0)}`, sub: 'Last 7 days' },
                  { label: 'Pending Payments', value: pendingPayments, sub: 'Needs attention' },
                ].map((stat, i) => (
                  <div key={i} style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, padding: '16px 20px' }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: brand.textLight, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>{stat.label}</p>
                    <p style={{ fontSize: 24, fontWeight: 700, color: brand.navy, letterSpacing: '-0.02em', marginBottom: 2 }}>{stat.value}</p>
                    <p style={{ fontSize: 12, color: brand.textLight }}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
                <input type="text" placeholder="Search bookings..." value={searchBookings} onChange={(e) => setSearchBookings(e.target.value)} style={{ ...inputStyle, width: 240 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: brand.textLight, cursor: 'pointer', background: showCancelled ? '#FEF2F2' : '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid ' + brand.border }}>
                  <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} style={{ cursor: 'pointer' }} />
                  Cancelled
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: brand.textLight, cursor: 'pointer', background: showSkipped ? '#FFFBEB' : '#fff', padding: '6px 12px', borderRadius: 6, border: '1px solid ' + brand.border }}>
                  <input type="checkbox" checked={showSkipped} onChange={(e) => setShowSkipped(e.target.checked)} style={{ cursor: 'pointer' }} />
                  Skipped
                </label>
              </div>

              <div className="table-wrapper">
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden', minWidth: 800 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                        {[
                          { field: 'customer_name', label: 'Customer' },
                          { field: 'building', label: 'Property' },
                          { field: 'booking_date', label: 'Date & Time' },
                          { field: 'total_price', label: 'Amount' },
                          { field: 'status', label: 'Status' },
                          { field: 'payment_status', label: 'Payment' },
                          { field: 'worker_id', label: 'Worker' },
                        ].map(col => (
                          <th key={col.field} onClick={() => handleSort(col.field)} style={{ ...thStyle, cursor: 'pointer', userSelect: 'none', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                            {col.label}{sortIndicator(col.field)}
                          </th>
                        ))}
                        <th style={{ ...thStyle, textAlign: 'right', position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBookings.map(booking => {
                        const freqName = getFrequencyName(booking.frequency_id);
                        const statusStyle = getStatusStyle(booking.status);
                        const isRecurring = !!booking.recurring_group_id;
                        const isActionable = ['upcoming', 'scheduled'].includes(booking.status);

                        return (
                          <tr key={booking.id} className="table-row-hover" style={{ borderBottom: '1px solid ' + brand.border }}>
                            <td style={tdStyle}>
                              <p style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{booking.customer_name}</p>
                              <p style={{ fontSize: 12, color: brand.textLight }}>{booking.customer_email}</p>
                            </td>
                            <td style={tdStyle}>
                              <p style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{booking.building}</p>
                              <p style={{ fontSize: 12, color: brand.textLight }}>Unit {booking.unit_number} · {booking.floor_plan}</p>
                            </td>
                            <td style={tdStyle}>
                              <p style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{formatDate(booking.booking_date)}</p>
                              <p style={{ fontSize: 12, color: brand.textLight }}>{booking.booking_time}</p>
                              {freqName && freqName !== 'One-Time' && (
                                <p style={{ fontSize: 11, color: brand.navy, fontWeight: 600 }}>{freqName}</p>
                              )}
                              {isRecurring && (
                                <p style={{ fontSize: 11, color: brand.textLight }}>Recurring</p>
                              )}
                            </td>
                            <td style={tdStyle}>
                              <span style={{ fontWeight: 600, color: brand.text, fontSize: 13 }}>${booking.total_price}</span>
                              {booking.frequency_discount > 0 && (
                                <p style={{ fontSize: 11, color: brand.textLight }}>-${booking.frequency_discount}</p>
                              )}
                            </td>
                            <td style={tdStyle}>
                              <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 12, fontWeight: 500, ...statusStyle }}>
                                {booking.status}
                              </span>
                            </td>
                            <td style={tdStyle}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <span style={{ padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, ...getPaymentStatusStyle(booking.payment_status) }}>
                                  {booking.payment_status || 'n/a'}
                                </span>
                                {booking.payment_status === 'pending' && booking.stripe_customer_id && (
                                  <button
                                    onClick={() => handleChargeBooking(booking.id)}
                                    disabled={chargingBookingId === booking.id}
                                    style={{ ...buttonStyle, background: '#065F46', color: '#fff', fontSize: 11, padding: '4px 8px', opacity: chargingBookingId === booking.id ? 0.6 : 1 }}
                                  >
                                    {chargingBookingId === booking.id ? '...' : 'Charge'}
                                  </button>
                                )}
                              </div>
                            </td>
                            <td style={tdStyle}>
                              <select
                                value={booking.worker_id || ''}
                                onChange={(e) => handleWorkerAssign(booking.id, e.target.value)}
                                style={{ ...inputStyle, width: 120, fontSize: 12, padding: '6px 8px' }}
                              >
                                <option value="">Unassigned</option>
                                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                              </select>
                            </td>
                            <td style={{ ...tdStyle, textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                                {isActionable && (
                                  <>
                                    <button onClick={() => handleMarkComplete(booking.id)} title="Complete" style={{ ...iconBtnStyle, background: '#F0FDF4', color: '#16A34A' }}>
                                      <SidebarIcon name="check" />
                                    </button>
                                    <button onClick={() => handleSkipBooking(booking.id)} title="Skip" style={{ ...iconBtnStyle, background: '#FFFBEB', color: '#D97706' }}>
                                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
                                    </button>
                                    <button onClick={() => handleCancelBooking(booking.id)} title="Cancel" style={{ ...iconBtnStyle, background: '#FEF2F2', color: brand.danger }}>
                                      <SidebarIcon name="x" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {sortedBookings.length === 0 && (
                        <tr>
                          <td colSpan={8} style={{ padding: 48, textAlign: 'center' }}>
                            <p style={{ fontSize: 14, color: brand.textLight, marginBottom: 4 }}>No bookings found</p>
                            <p style={{ fontSize: 12, color: brand.textLight }}>Try adjusting your filters</p>
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
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em', marginBottom: 4 }}>Customers</h1>
                    <p style={{ fontSize: 13, color: brand.textLight }}>{customers.length} customer{customers.length !== 1 ? 's' : ''} found</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, or phone..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={{ ...inputStyle, width: 260 }}
                  />
                </div>
                <div className="table-wrapper">
                  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden', minWidth: 700 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                          <th style={{ ...thStyle, width: 30 }}></th>
                          <th style={thStyle}>Customer</th>
                          <th style={thStyle}>Account</th>
                          <th style={thStyle}>Bookings</th>
                          <th style={thStyle}>Total Spent</th>
                          <th style={thStyle}>Last Booking</th>
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
                                className="table-row-hover"
                                style={{ borderBottom: '1px solid ' + brand.border, cursor: 'pointer', background: isExpanded ? brand.bg : 'transparent' }}
                              >
                                <td style={{ padding: '12px 8px 12px 16px', fontSize: 12, color: brand.textLight }}>
                                  {isExpanded ? '▼' : '▶'}
                                </td>
                                <td style={tdStyle}>
                                  <p style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{c.name || 'Unknown'}</p>
                                  <p style={{ fontSize: 12, color: brand.textLight }}>{c.email}</p>
                                  {c.phone && <p style={{ fontSize: 11, color: brand.textLight }}>{c.phone}</p>}
                                </td>
                                <td style={tdStyle}>
                                  <span style={{
                                    padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                                    background: c.hasAccount ? '#DBEAFE' : '#f3f4f6',
                                    color: c.hasAccount ? '#1E40AF' : brand.textLight
                                  }}>
                                    {c.hasAccount ? 'Registered' : 'Guest'}
                                  </span>
                                </td>
                                <td style={tdStyle}>
                                  <span style={{ fontWeight: 600, color: brand.text, fontSize: 13 }}>{c.bookings.length}</span>
                                  <span style={{ fontSize: 11, color: brand.textLight, marginLeft: 6 }}>
                                    ({upcomingCount} upcoming, {completedCount} done{cancelledCount > 0 ? `, ${cancelledCount} cancelled` : ''})
                                  </span>
                                </td>
                                <td style={tdStyle}>
                                  <span style={{ fontWeight: 600, color: brand.text, fontSize: 13 }}>${c.totalSpent.toFixed(2)}</span>
                                </td>
                                <td style={tdStyle}>
                                  <span style={{ color: brand.text, fontSize: 13 }}>{formatDate(c.lastBooking)}</span>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={6} style={{ padding: 0 }}>
                                    <div style={{ padding: '0 16px 16px 48px', background: brand.bg }}>

                                      {/* Customer Info Section */}
                                      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid ' + brand.border, padding: 16, marginBottom: 16, marginTop: 8 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                          <p style={{ fontSize: 13, fontWeight: 600, color: brand.text }}>Customer Info</p>
                                          {editingCustomerEmail === c.email ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                              <button onClick={() => handleSaveCustomerInfo(c.email, c.bookings, c.user_id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', fontSize: 12, padding: '5px 12px' }}>Save</button>
                                              <button onClick={() => { setEditingCustomerEmail(null); setEditingCustomerValue({}); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, fontSize: 12, padding: '5px 12px', border: '1px solid ' + brand.border }}>Cancel</button>
                                            </div>
                                          ) : (
                                            <button onClick={() => { setEditingCustomerEmail(c.email); setEditingCustomerValue({ customer_name: c.name || '', customer_email: c.email, phone: c.phone || '' }); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, fontSize: 12, padding: '5px 12px', border: '1px solid ' + brand.border }}><SidebarIcon name="edit" /> Edit</button>
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
                                      <p style={{ fontSize: 13, fontWeight: 600, color: brand.text, marginBottom: 10 }}>
                                        Booking History ({c.bookings.length})
                                      </p>
                                      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                          <thead>
                                            <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                                              <th style={thStyle}>Date & Time</th>
                                              <th style={thStyle}>Property</th>
                                              <th style={thStyle}>Frequency</th>
                                              <th style={thStyle}>Total</th>
                                              <th style={thStyle}>Status</th>
                                              <th style={thStyle}>Worker</th>
                                              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
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
                                                  <tr key={b.id} style={{ borderBottom: '1px solid ' + brand.border }}>
                                                    <td style={{ padding: '8px 12px' }}>
                                                      {isEditing ? (
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                          <input type="date" style={{ ...inputStyle, fontSize: 12, padding: '5px 8px' }} value={editingBookingValue.booking_date || ''} onChange={(e) => setEditingBookingValue({ ...editingBookingValue, booking_date: e.target.value })} />
                                                          <input type="text" style={{ ...inputStyle, fontSize: 12, padding: '5px 8px' }} value={editingBookingValue.booking_time || ''} onChange={(e) => setEditingBookingValue({ ...editingBookingValue, booking_time: e.target.value })} placeholder="e.g. 9:00 AM" />
                                                        </div>
                                                      ) : (
                                                        <>
                                                          <p style={{ fontWeight: 500, color: brand.text, fontSize: 12 }}>{formatDate(b.booking_date)}</p>
                                                          <p style={{ fontSize: 11, color: brand.textLight }}>{b.booking_time}</p>
                                                        </>
                                                      )}
                                                    </td>
                                                    <td style={{ padding: '8px 12px' }}>
                                                      {isEditing ? (
                                                        <div>
                                                          <p style={{ fontWeight: 500, color: brand.text, fontSize: 12 }}>{b.building}</p>
                                                          <input style={{ ...inputStyle, fontSize: 12, padding: '5px 8px', marginTop: 4 }} value={editingBookingValue.unit_number || ''} onChange={(e) => setEditingBookingValue({ ...editingBookingValue, unit_number: e.target.value })} placeholder="Unit #" />
                                                        </div>
                                                      ) : (
                                                        <>
                                                          <p style={{ fontWeight: 500, color: brand.text, fontSize: 12 }}>{b.building}</p>
                                                          <p style={{ fontSize: 11, color: brand.textLight }}>Unit {b.unit_number} · {b.floor_plan}</p>
                                                        </>
                                                      )}
                                                    </td>
                                                    <td style={{ padding: '8px 12px' }}>
                                                      {freqName && freqName !== 'One-Time' ? (
                                                        <span style={{ fontSize: 11, color: brand.navy, fontWeight: 600 }}>{freqName}</span>
                                                      ) : (
                                                        <span style={{ fontSize: 11, color: brand.textLight }}>One-Time</span>
                                                      )}
                                                    </td>
                                                    <td style={{ padding: '8px 12px' }}>
                                                      <span style={{ fontWeight: 600, color: brand.text, fontSize: 12 }}>${b.total_price}</span>
                                                    </td>
                                                    <td style={{ padding: '8px 12px' }}>
                                                      <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 11, fontWeight: 500, ...statusStyle }}>
                                                        {b.status}
                                                      </span>
                                                    </td>
                                                    <td style={{ padding: '8px 12px' }}>
                                                      {isEditing ? (
                                                        <select style={{ ...inputStyle, fontSize: 12, padding: '5px 8px', width: 110 }} value={editingBookingValue.worker_id || ''} onChange={(e) => setEditingBookingValue({ ...editingBookingValue, worker_id: e.target.value })}>
                                                          <option value="">Unassigned</option>
                                                          {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                                        </select>
                                                      ) : (
                                                        <span style={{ fontSize: 12, color: workerName ? brand.text : brand.textLight }}>{workerName || 'Unassigned'}</span>
                                                      )}
                                                    </td>
                                                    <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                                      <div style={{ display: 'flex', gap: 3, justifyContent: 'flex-end' }}>
                                                        {isEditing ? (
                                                          <>
                                                            <button onClick={() => handleSaveBookingEdit(b.id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', fontSize: 11, padding: '4px 10px' }}>Save</button>
                                                            <button onClick={() => { setEditingBookingId(null); setEditingBookingValue({}); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, fontSize: 11, padding: '4px 10px', border: '1px solid ' + brand.border }}>Cancel</button>
                                                          </>
                                                        ) : (
                                                          <>
                                                            <button onClick={(e) => { e.stopPropagation(); setEditingBookingId(b.id); setEditingBookingValue({ booking_date: b.booking_date, booking_time: b.booking_time || '', worker_id: b.worker_id || '', unit_number: b.unit_number || '', special_instructions: b.special_instructions || '' }); }} title="Edit" style={{ ...iconBtnStyle, background: '#fff', color: brand.textLight, border: '1px solid ' + brand.border }}><SidebarIcon name="edit" /></button>
                                                            {isActionable && (
                                                              <>
                                                                <button onClick={(e) => { e.stopPropagation(); handleMarkComplete(b.id); }} title="Complete" style={{ ...iconBtnStyle, background: '#F0FDF4', color: '#16A34A' }}><SidebarIcon name="check" /></button>
                                                                <button onClick={(e) => { e.stopPropagation(); handleCancelBooking(b.id); }} title="Cancel" style={{ ...iconBtnStyle, background: '#FEF2F2', color: brand.danger }}><SidebarIcon name="x" /></button>
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
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em' }}>Frequencies</h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Search frequencies..." value={searchFrequencies} onChange={(e) => setSearchFrequencies(e.target.value)} style={{ ...inputStyle, width: 200 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showArchivedFrequencies} onChange={(e) => setShowArchivedFrequencies(e.target.checked)} />
                    Show archived
                  </label>
                  <button onClick={() => handleAdd('frequencies')} style={{ ...buttonStyle, background: brand.navy, color: '#fff' }}>+ Add Frequency</button>
                </div>
              </div>
              <div className="table-wrapper">
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Discount %</th>
                        <th style={thStyle}>Interval (days)</th>
                        <th style={thStyle}>Sort Order</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFrequenciesList.map(f => (
                        <tr key={f.id} style={{ borderBottom: '1px solid ' + brand.border, opacity: f.archived ? 0.6 : 1 }}>
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
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4, background: f.archived ? '#fee2e2' : '#dcfce7', color: f.archived ? brand.danger : '#16a34a' }}>
                              {f.archived ? 'Archived' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `frequency-${f.id}` ? (
                              <button onClick={() => handleSave('frequencies', f.id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', marginRight: 6 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`frequency-${f.id}`); setEditValue({ name: f.name, discount_percent: f.discount_percent, interval_days: f.interval_days, sort_order: f.sort_order }); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, marginRight: 6, border: '1px solid ' + brand.border }}>Edit</button>
                            )}
                            <button onClick={() => handleToggleArchive('frequencies', f.id, f.archived)} style={{ ...buttonStyle, background: f.archived ? '#DBEAFE' : '#FFFBEB', color: f.archived ? '#2563EB' : '#D97706', marginRight: 6 }}>
                              {f.archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button onClick={() => handleDelete('frequencies', f.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                      {filteredFrequenciesList.length === 0 && (
                        <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: brand.textLight }}>No frequencies found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* NEIGHBORHOODS TAB */}
          {activeTab === 'neighborhoods' && (
            <div>
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em' }}>Neighborhoods</h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Search neighborhoods..." value={searchNeighborhoods} onChange={(e) => setSearchNeighborhoods(e.target.value)} style={{ ...inputStyle, width: 200 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showArchivedNeighborhoods} onChange={(e) => setShowArchivedNeighborhoods(e.target.checked)} />
                    Show archived
                  </label>
                  <button onClick={() => handleAdd('neighborhoods')} style={{ ...buttonStyle, background: brand.navy, color: '#fff' }}>+ Add Neighborhood</button>
                </div>
              </div>
              <div className="table-wrapper">
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Buildings</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredNeighborhoods.map(n => (
                        <tr key={n.id} style={{ borderBottom: '1px solid ' + brand.border, opacity: n.archived ? 0.6 : 1 }}>
                          <td style={{ padding: '16px' }}>
                            {editingId === `neighborhood-${n.id}` ? (
                              <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                            ) : (
                              <span style={{ fontWeight: 500, color: brand.text }}>{n.name}</span>
                            )}
                          </td>
                          <td style={{ padding: '16px', color: brand.textLight }}>{buildings.filter(b => b.neighborhood_id === n.id).length} buildings</td>
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4, background: n.archived ? '#fee2e2' : '#dcfce7', color: n.archived ? brand.danger : '#16a34a' }}>
                              {n.archived ? 'Archived' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `neighborhood-${n.id}` ? (
                              <button onClick={() => handleSave('neighborhoods', n.id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', marginRight: 6 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`neighborhood-${n.id}`); setEditValue({ name: n.name }); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, marginRight: 6, border: '1px solid ' + brand.border }}>Edit</button>
                            )}
                            <button onClick={() => handleToggleArchive('neighborhoods', n.id, n.archived)} style={{ ...buttonStyle, background: n.archived ? '#DBEAFE' : '#FFFBEB', color: n.archived ? '#2563EB' : '#D97706', marginRight: 6 }}>
                              {n.archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button onClick={() => handleDelete('neighborhoods', n.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                      {filteredNeighborhoods.length === 0 && (
                        <tr><td colSpan={4} style={{ padding: 24, textAlign: 'center', color: brand.textLight }}>No neighborhoods found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* BUILDINGS TAB */}
          {activeTab === 'buildings' && (
            <div>
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em' }}>Buildings <span style={{ fontSize: 14, fontWeight: 400, color: brand.textLight }}>({filteredBuildings.length})</span></h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Search buildings..." value={searchBuildings} onChange={(e) => setSearchBuildings(e.target.value)} style={{ ...inputStyle, width: 200 }} />
                  <select value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)} style={{ ...inputStyle, width: 180 }}>
                    <option value="">All Neighborhoods</option>
                    {neighborhoods.filter(n => !n.archived).map(n => <option key={n.id} value={String(n.id)}>{n.name}</option>)}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showArchivedBuildings} onChange={(e) => setShowArchivedBuildings(e.target.checked)} />
                    Show archived
                  </label>
                  <button onClick={() => handleAdd('buildings')} style={{ ...buttonStyle, background: brand.navy, color: '#fff' }}>+ Add Building</button>
                </div>
              </div>
              {/* Group buildings by neighborhood */}
              {(() => {
                const grouped = {};
                filteredBuildings.forEach(b => {
                  const nhood = neighborhoods.find(n => n.id === b.neighborhood_id);
                  const key = nhood ? nhood.id : '_none';
                  const label = nhood ? nhood.name : 'No Neighborhood';
                  if (!grouped[key]) grouped[key] = { label, buildings: [] };
                  grouped[key].buildings.push(b);
                });
                const groups = Object.entries(grouped);
                if (groups.length === 0) return <div style={{ padding: 24, textAlign: 'center', color: brand.textLight, background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border }}>No buildings found.</div>;
                return groups.map(([key, group]) => {
                  const sectionKey = `building-nh-${key}`;
                  const isCollapsed = collapsedSections[sectionKey];
                  return (
                    <div key={key} style={{ marginBottom: 12, background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                      <div onClick={() => toggleSection(sectionKey)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', cursor: 'pointer', userSelect: 'none', background: brand.bg, borderBottom: isCollapsed ? 'none' : '1px solid ' + brand.border }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                        <span style={{ fontWeight: 600, fontSize: 14, color: brand.text }}>{group.label}</span>
                        <span style={{ fontSize: 12, color: brand.textLight }}>({group.buildings.length})</span>
                      </div>
                      {!isCollapsed && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                              <th style={thStyle}>Name</th>
                              <th style={thStyle}>Address</th>
                              <th style={thStyle}>Status</th>
                              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.buildings.map(b => (
                              <tr key={b.id} style={{ borderBottom: '1px solid ' + brand.border, opacity: b.archived ? 0.6 : 1 }}>
                                <td style={{ padding: '8px 16px' }}>
                                  {editingId === `building-${b.id}` ? (
                                    <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                                  ) : (
                                    <span style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{b.name}</span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                  {editingId === `building-${b.id}` ? (
                                    <input style={inputStyle} value={editValue.address || ''} onChange={(e) => setEditValue({ ...editValue, address: e.target.value })} />
                                  ) : (
                                    <span style={{ color: brand.textLight, fontSize: 13 }}>{b.address}</span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 6px', borderRadius: 4, background: b.archived ? '#fee2e2' : '#dcfce7', color: b.archived ? brand.danger : '#16a34a' }}>
                                    {b.archived ? 'Archived' : 'Active'}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                  {editingId === `building-${b.id}` ? (
                                    <>
                                      <select style={{ ...inputStyle, width: 140, display: 'inline-block', marginRight: 6 }} value={editValue.neighborhood_id || ''} onChange={(e) => setEditValue({ ...editValue, neighborhood_id: e.target.value })}>
                                        {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                                      </select>
                                      <button onClick={() => handleSave('buildings', b.id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', marginRight: 6, padding: '5px 10px', fontSize: 12 }}>Save</button>
                                    </>
                                  ) : (
                                    <button onClick={() => { setEditingId(`building-${b.id}`); setEditValue({ name: b.name, address: b.address, neighborhood_id: b.neighborhood_id }); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, marginRight: 6, border: '1px solid ' + brand.border, padding: '5px 10px', fontSize: 12 }}>Edit</button>
                                  )}
                                  <button onClick={() => handleToggleArchive('buildings', b.id, b.archived)} style={{ ...buttonStyle, background: b.archived ? '#DBEAFE' : '#FFFBEB', color: b.archived ? '#2563EB' : '#D97706', marginRight: 6, padding: '5px 10px', fontSize: 12 }}>
                                    {b.archived ? 'Unarchive' : 'Archive'}
                                  </button>
                                  <button onClick={() => handleDelete('buildings', b.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger, padding: '5px 10px', fontSize: 12 }}>Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* FLOOR PLANS TAB */}
          {activeTab === 'floorplans' && (
            <div>
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em' }}>Floor Plans <span style={{ fontSize: 14, fontWeight: 400, color: brand.textLight }}>({filteredFloorPlans.length})</span></h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Search floor plans..." value={searchFloorPlans} onChange={(e) => setSearchFloorPlans(e.target.value)} style={{ ...inputStyle, width: 200 }} />
                  <select value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)} style={{ ...inputStyle, width: 200 }}>
                    <option value="">All Buildings</option>
                    {buildings.filter(b => !b.archived).map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showArchivedFloorPlans} onChange={(e) => setShowArchivedFloorPlans(e.target.checked)} />
                    Show archived
                  </label>
                </div>
              </div>
              {/* Group floor plans by building */}
              {(() => {
                const grouped = {};
                // Pre-populate with all visible buildings so they show even with 0 plans
                const visibleBuildings = buildings.filter(b => {
                  if (b.archived && !showArchivedFloorPlans) return false;
                  if (selectedBuilding && String(b.id) !== String(selectedBuilding)) return false;
                  return true;
                });
                visibleBuildings.forEach(b => {
                  grouped[b.id] = { label: b.name, buildingId: b.id, plans: [] };
                });
                filteredFloorPlans.forEach(f => {
                  const bldg = buildings.find(b => b.id === f.building_id);
                  const key = bldg ? bldg.id : '_none';
                  const label = bldg ? bldg.name : 'No Building';
                  if (!grouped[key]) grouped[key] = { label, buildingId: bldg?.id, plans: [] };
                  grouped[key].plans.push(f);
                });
                const groups = Object.entries(grouped);
                if (groups.length === 0) return <div style={{ padding: 24, textAlign: 'center', color: brand.textLight, background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border }}>No floor plans found.</div>;
                return groups.map(([key, group]) => {
                  const sectionKey = `fp-bldg-${key}`;
                  const isCollapsed = collapsedSections[sectionKey];
                  return (
                    <div key={key} style={{ marginBottom: 12, background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                      <div onClick={() => toggleSection(sectionKey)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', cursor: 'pointer', userSelect: 'none', background: brand.bg, borderBottom: isCollapsed ? 'none' : '1px solid ' + brand.border }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                        <span style={{ fontWeight: 600, fontSize: 14, color: brand.text }}>{group.label}</span>
                        <span style={{ fontSize: 12, color: brand.textLight }}>({group.plans.length} {group.plans.length === 1 ? 'plan' : 'plans'})</span>
                        <div style={{ marginLeft: 'auto' }} onClick={(e) => e.stopPropagation()}>
                          {group.buildingId && <button onClick={() => handleAddFloorPlanToBuilding(group.buildingId)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', padding: '4px 10px', fontSize: 11 }}>+ Add Floor Plan</button>}
                        </div>
                      </div>
                      {!isCollapsed && group.plans.length === 0 && (
                        <div style={{ padding: '16px 16px', color: brand.textLight, fontSize: 13 }}>No floor plans yet. Click "+ Add Floor Plan" above to create one.</div>
                      )}
                      {!isCollapsed && group.plans.length > 0 && (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                              <th style={thStyle}>Name</th>
                              <th style={thStyle}>Price</th>
                              <th style={thStyle}>Duration</th>
                              <th style={thStyle}>Status</th>
                              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.plans.map(f => (
                              <tr key={f.id} style={{ borderBottom: '1px solid ' + brand.border, opacity: f.archived ? 0.6 : 1 }}>
                                <td style={{ padding: '8px 16px' }}>
                                  {editingId === `floorplan-${f.id}` ? (
                                    <input style={inputStyle} value={editValue.name || ''} onChange={(e) => setEditValue({ ...editValue, name: e.target.value })} />
                                  ) : (
                                    <span style={{ fontWeight: 500, color: brand.text, fontSize: 13 }}>{f.name}</span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                  {editingId === `floorplan-${f.id}` ? (
                                    <input style={{ ...inputStyle, width: 100 }} type="number" value={editValue.price || 0} onChange={(e) => setEditValue({ ...editValue, price: Number(e.target.value) })} />
                                  ) : (
                                    <span style={{ fontWeight: 600, color: brand.text, fontSize: 13 }}>${f.price}</span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                  {editingId === `floorplan-${f.id}` ? (
                                    <input style={{ ...inputStyle, width: 80 }} type="number" min="15" step="15" value={editValue.duration_minutes || 60} onChange={(e) => setEditValue({ ...editValue, duration_minutes: Number(e.target.value) })} />
                                  ) : (
                                    <span style={{ color: brand.textLight, fontSize: 13 }}>{f.duration_minutes || 60} min</span>
                                  )}
                                </td>
                                <td style={{ padding: '8px 16px' }}>
                                  <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 6px', borderRadius: 4, background: f.archived ? '#fee2e2' : '#dcfce7', color: f.archived ? brand.danger : '#16a34a' }}>
                                    {f.archived ? 'Archived' : 'Active'}
                                  </span>
                                </td>
                                <td style={{ padding: '8px 16px', textAlign: 'right' }}>
                                  {editingId === `floorplan-${f.id}` ? (
                                    <>
                                      <select style={{ ...inputStyle, width: 140, display: 'inline-block', marginRight: 6 }} value={editValue.building_id || ''} onChange={(e) => setEditValue({ ...editValue, building_id: Number(e.target.value) })}>
                                        {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                      </select>
                                      <button onClick={() => handleSave('floorplans', f.id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', marginRight: 6, padding: '5px 10px', fontSize: 12 }}>Save</button>
                                    </>
                                  ) : (
                                    <button onClick={() => { setEditingId(`floorplan-${f.id}`); setEditValue({ name: f.name, price: f.price, duration_minutes: f.duration_minutes || 60, building_id: f.building_id }); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, marginRight: 6, border: '1px solid ' + brand.border, padding: '5px 10px', fontSize: 12 }}>Edit</button>
                                  )}
                                  <button onClick={() => handleToggleArchive('floorplans', f.id, f.archived)} style={{ ...buttonStyle, background: f.archived ? '#DBEAFE' : '#FFFBEB', color: f.archived ? '#2563EB' : '#D97706', marginRight: 6, padding: '5px 10px', fontSize: 12 }}>
                                    {f.archived ? 'Unarchive' : 'Archive'}
                                  </button>
                                  <button onClick={() => handleDelete('floorplans', f.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger, padding: '5px 10px', fontSize: 12 }}>Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* UNIT LINES TAB */}
          {activeTab === 'unitlines' && (
            <div>
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em' }}>Unit Lines <span style={{ fontSize: 14, fontWeight: 400, color: brand.textLight }}>({filteredUnitLines.length})</span></h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Search unit lines..." value={searchUnitLines} onChange={(e) => setSearchUnitLines(e.target.value)} style={{ ...inputStyle, width: 200 }} />
                  <select value={selectedBuildingUL} onChange={(e) => setSelectedBuildingUL(e.target.value)} style={{ ...inputStyle, width: 200 }}>
                    <option value="">All Buildings</option>
                    {buildings.filter(b => !b.archived).map(b => <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                  </select>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showArchivedUnitLines} onChange={(e) => setShowArchivedUnitLines(e.target.checked)} />
                    Show archived
                  </label>
                </div>
              </div>
              {/* Group unit lines by building, then by floor plan */}
              {(() => {
                // First group by building, pre-populate with all visible buildings
                const byBuilding = {};
                const visibleBuildingsUL = buildings.filter(b => {
                  if (b.archived && !showArchivedUnitLines) return false;
                  if (selectedBuildingUL && String(b.id) !== String(selectedBuildingUL)) return false;
                  return true;
                });
                visibleBuildingsUL.forEach(b => {
                  byBuilding[b.id] = { label: b.name, buildingId: b.id, unitLines: [] };
                });
                filteredUnitLines.forEach(ul => {
                  const bldg = buildings.find(b => b.id === ul.building_id);
                  const bKey = bldg ? bldg.id : '_none';
                  const bLabel = bldg ? bldg.name : 'No Building';
                  if (!byBuilding[bKey]) byBuilding[bKey] = { label: bLabel, buildingId: bldg?.id, unitLines: [] };
                  byBuilding[bKey].unitLines.push(ul);
                });
                const buildingGroups = Object.entries(byBuilding);
                if (buildingGroups.length === 0) return <div style={{ padding: 24, textAlign: 'center', color: brand.textLight, background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border }}>No unit lines found.</div>;
                return buildingGroups.map(([bKey, bGroup]) => {
                  const bSectionKey = `ul-bldg-${bKey}`;
                  const bCollapsed = collapsedSections[bSectionKey];
                  // Sub-group by floor plan within this building
                  const byFloorPlan = {};
                  bGroup.unitLines.forEach(ul => {
                    const fp = floorPlans.find(f => f.id === ul.floor_plan_id);
                    const fpKey = fp ? fp.id : '_none';
                    const fpLabel = fp ? fp.name : 'No Floor Plan';
                    if (!byFloorPlan[fpKey]) byFloorPlan[fpKey] = { label: fpLabel, lines: [] };
                    byFloorPlan[fpKey].lines.push(ul);
                  });
                  const fpGroups = Object.entries(byFloorPlan);
                  return (
                    <div key={bKey} style={{ marginBottom: 12, background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                      {/* Building header */}
                      <div onClick={() => toggleSection(bSectionKey)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', cursor: 'pointer', userSelect: 'none', background: brand.bg, borderBottom: bCollapsed ? 'none' : '1px solid ' + brand.border }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: bCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                        <span style={{ fontWeight: 600, fontSize: 14, color: brand.text }}>{bGroup.label}</span>
                        <span style={{ fontSize: 12, color: brand.textLight }}>({bGroup.unitLines.length} {bGroup.unitLines.length === 1 ? 'line' : 'lines'})</span>
                        <div style={{ marginLeft: 'auto' }} onClick={(e) => e.stopPropagation()}>
                          {bGroup.buildingId && <button onClick={() => handleAddUnitLineToBuilding(bGroup.buildingId)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', padding: '4px 10px', fontSize: 11 }}>+ Add Unit Line</button>}
                        </div>
                      </div>
                      {!bCollapsed && bGroup.unitLines.length === 0 && (
                        <div style={{ padding: '16px 16px', color: brand.textLight, fontSize: 13 }}>No unit lines yet. Click "+ Add Unit Line" above to create one.</div>
                      )}
                      {!bCollapsed && fpGroups.map(([fpKey, fpGroup]) => {
                        const fpSectionKey = `ul-fp-${bKey}-${fpKey}`;
                        const fpCollapsed = collapsedSections[fpSectionKey];
                        return (
                          <div key={fpKey}>
                            {/* Floor plan sub-header */}
                            <div onClick={() => toggleSection(fpSectionKey)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 8px 36px', cursor: 'pointer', userSelect: 'none', background: '#fff', borderBottom: fpCollapsed ? '1px solid ' + brand.border : '1px solid ' + brand.border }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={brand.textLight} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: fpCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9"/></svg>
                              <span style={{ fontWeight: 500, fontSize: 13, color: brand.text }}>{fpGroup.label}</span>
                              <span style={{ fontSize: 12, color: brand.textLight }}>({fpGroup.lines.length} {fpGroup.lines.length === 1 ? 'line' : 'lines'})</span>
                            </div>
                            {!fpCollapsed && fpGroup.lines.map(ul => {
                              const fp = floorPlans.find(f => f.id === ul.floor_plan_id);
                              const displayPrice = ul.custom_price != null ? `$${ul.custom_price}` : (fp ? `$${fp.price}` : '—');
                              const isEditing = editingId === `unitline-${ul.id}`;
                              return (
                                <div key={ul.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 16px 6px 56px', borderBottom: '1px solid ' + brand.border, opacity: ul.archived ? 0.6 : 1, fontSize: 13 }}>
                                  {isEditing ? (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, flexWrap: 'wrap' }}>
                                      <select style={{ ...inputStyle, width: 130 }} value={editValue.building_id || ''} onChange={(e) => setEditValue({ ...editValue, building_id: Number(e.target.value) })}>
                                        {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                                      </select>
                                      <span style={{ color: brand.textLight, fontSize: 12 }}>Line</span>
                                      <input style={{ ...inputStyle, width: 60 }} value={editValue.line_number || ''} onChange={(e) => setEditValue({ ...editValue, line_number: e.target.value })} />
                                      <span style={{ color: brand.textLight, fontSize: 12 }}>Floors</span>
                                      <input style={{ ...inputStyle, width: 55 }} type="number" min="1" value={editValue.floor_min || 1} onChange={(e) => setEditValue({ ...editValue, floor_min: Number(e.target.value) })} />
                                      <span style={{ color: brand.textLight }}>-</span>
                                      <input style={{ ...inputStyle, width: 55 }} type="number" min="1" value={editValue.floor_max || 99} onChange={(e) => setEditValue({ ...editValue, floor_max: Number(e.target.value) })} />
                                      <select style={{ ...inputStyle, width: 120 }} value={editValue.floor_plan_id || ''} onChange={(e) => setEditValue({ ...editValue, floor_plan_id: e.target.value ? Number(e.target.value) : '' })}>
                                        <option value="">— None —</option>
                                        {floorPlans.filter(f => f.building_id === (editValue.building_id || ul.building_id) && !f.archived).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                      </select>
                                      <span style={{ color: brand.textLight, fontSize: 12 }}>$</span>
                                      <input style={{ ...inputStyle, width: 70 }} type="number" placeholder={fp ? `${fp.price}` : ''} value={editValue.custom_price ?? ''} onChange={(e) => setEditValue({ ...editValue, custom_price: e.target.value })} />
                                      <button onClick={() => handleSave('unitlines', ul.id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', padding: '5px 10px', fontSize: 12 }}>Save</button>
                                    </div>
                                  ) : (
                                    <>
                                      <span style={{ color: brand.text, minWidth: 60 }}>Line {ul.line_number}</span>
                                      <span style={{ color: brand.textLight }}>floors {ul.floor_min}-{ul.floor_max}</span>
                                      <span style={{ fontWeight: 600, color: brand.text }}>{displayPrice}{ul.custom_price != null ? <span style={{ fontSize: 11, color: brand.textLight, marginLeft: 2 }}>(custom)</span> : ''}</span>
                                      {ul.archived && <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 6px', borderRadius: 4, background: '#fee2e2', color: brand.danger }}>Archived</span>}
                                      <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                                        <button onClick={() => { setEditingId(`unitline-${ul.id}`); setEditValue({ building_id: ul.building_id, line_number: ul.line_number, floor_min: ul.floor_min, floor_max: ul.floor_max, floor_plan_id: ul.floor_plan_id || '', custom_price: ul.custom_price ?? '' }); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, border: '1px solid ' + brand.border, padding: '4px 8px', fontSize: 11 }}>Edit</button>
                                        <button onClick={() => handleToggleArchive('unitlines', ul.id, ul.archived)} style={{ ...buttonStyle, background: ul.archived ? '#DBEAFE' : '#FFFBEB', color: ul.archived ? '#2563EB' : '#D97706', padding: '4px 8px', fontSize: 11 }}>
                                          {ul.archived ? 'Unarchive' : 'Archive'}
                                        </button>
                                        <button onClick={() => handleDelete('unitlines', ul.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger, padding: '4px 8px', fontSize: 11 }}>Delete</button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {/* ADD-ONS TAB */}
          {activeTab === 'addons' && (
            <div>
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em' }}>Add-Ons</h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Search add-ons..." value={searchAddOns} onChange={(e) => setSearchAddOns(e.target.value)} style={{ ...inputStyle, width: 200 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showArchivedAddOns} onChange={(e) => setShowArchivedAddOns(e.target.checked)} />
                    Show archived
                  </label>
                  <button onClick={() => handleAdd('addons')} style={{ ...buttonStyle, background: brand.navy, color: '#fff' }}>+ Add Add-On</button>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderRadius: 8, border: '1px solid ' + brand.border, background: '#fff', marginBottom: 16 }}>
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
              <div className="table-wrapper">
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Price</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAddOnsList.map(a => (
                        <tr key={a.id} style={{ borderBottom: '1px solid ' + brand.border, opacity: a.archived ? 0.6 : 1 }}>
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
                              fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4,
                              background: a.archived ? '#fee2e2' : '#dcfce7',
                              color: a.archived ? brand.danger : '#16a34a',
                            }}>
                              {a.archived ? 'Archived' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `addon-${a.id}` ? (
                              <button onClick={() => handleSave('addons', a.id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', marginRight: 6 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`addon-${a.id}`); setEditValue({ name: a.name, price: a.price }); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, marginRight: 6, border: '1px solid ' + brand.border }}>Edit</button>
                            )}
                            <button onClick={() => handleToggleArchive('addons', a.id, a.archived)} style={{ ...buttonStyle, background: a.archived ? '#DBEAFE' : '#FFFBEB', color: a.archived ? '#2563EB' : '#D97706', marginRight: 6 }}>
                              {a.archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button onClick={() => handleDelete('addons', a.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger }}>Delete</button>
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
              <div className="admin-tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em' }}>Workers</h1>
                <div className="admin-filter-controls" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Search workers..." value={searchWorkers} onChange={(e) => setSearchWorkers(e.target.value)} style={{ ...inputStyle, width: 200 }} />
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: brand.textLight, cursor: 'pointer' }}>
                    <input type="checkbox" checked={showArchivedWorkers} onChange={(e) => setShowArchivedWorkers(e.target.checked)} />
                    Show archived
                  </label>
                  <button onClick={() => handleAdd('workers')} style={{ ...buttonStyle, background: brand.navy, color: '#fff' }}>+ Add Worker</button>
                </div>
              </div>
              <div className="table-wrapper">
                <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid ' + brand.border }}>
                        <th style={thStyle}>Name</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Assigned Jobs</th>
                        <th style={thStyle}>Status</th>
                        <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWorkers.map(w => (
                        <tr key={w.id} style={{ borderBottom: '1px solid ' + brand.border, opacity: w.archived ? 0.6 : 1 }}>
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
                          <td style={{ padding: '16px' }}>
                            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 8px', borderRadius: 4, background: w.archived ? '#fee2e2' : '#dcfce7', color: w.archived ? brand.danger : '#16a34a' }}>
                              {w.archived ? 'Archived' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            {editingId === `worker-${w.id}` ? (
                              <button onClick={() => handleSave('workers', w.id)} style={{ ...buttonStyle, background: brand.navy, color: '#fff', marginRight: 6 }}>Save</button>
                            ) : (
                              <button onClick={() => { setEditingId(`worker-${w.id}`); setEditValue({ name: w.name, email: w.email, phone: w.phone }); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, marginRight: 6, border: '1px solid ' + brand.border }}>Edit</button>
                            )}
                            <button onClick={() => handleToggleArchive('workers', w.id, w.archived)} style={{ ...buttonStyle, background: w.archived ? '#DBEAFE' : '#FFFBEB', color: w.archived ? '#2563EB' : '#D97706', marginRight: 6 }}>
                              {w.archived ? 'Unarchive' : 'Archive'}
                            </button>
                            <button onClick={() => handleDelete('workers', w.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger }}>Delete</button>
                          </td>
                        </tr>
                      ))}
                      {filteredWorkers.length === 0 && (
                        <tr><td colSpan={6} style={{ padding: 24, textAlign: 'center', color: brand.textLight }}>No workers found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* AVAILABILITY TAB */}
          {activeTab === 'availability' && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em', marginBottom: 20 }}>Availability</h1>

              {/* Sub-tab navigation */}
              <div style={{ display: 'inline-flex', gap: 1, marginBottom: 24, background: '#F1F5F9', borderRadius: 8, padding: 3 }}>
                {[
                  { id: 'weekly', label: 'Weekly Schedules' },
                  { id: 'blocked', label: 'Blocked Dates' },
                  { id: 'overrides', label: 'Schedule Overrides' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAvailabilitySubTab(tab.id)}
                    style={{
                      padding: '7px 16px', fontSize: 13, fontWeight: 500,
                      color: availabilitySubTab === tab.id ? brand.text : brand.textLight,
                      background: availabilitySubTab === tab.id ? '#fff' : 'transparent',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: availabilitySubTab === tab.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* SUB-TAB 1: Weekly Schedules */}
              {availabilitySubTab === 'weekly' && (
                <div>
                  {!selectedWorkerAvail ? (
                    <div>
                      <p style={{ fontSize: 14, color: brand.textLight, marginBottom: 20 }}>Click on a worker to view and edit their weekly schedule.</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {workers.map(w => {
                          const workerAvail = getWorkerAvailability(w.id);
                          const activeDays = workerAvail.filter(d => d.is_active && !d.isNew).length;
                          const hasSchedule = workerAvail.some(d => !d.isNew);
                          return (
                            <div
                              key={w.id}
                              onClick={() => { setSelectedWorkerAvail(w.id); setEditingAvailability(getWorkerAvailability(w.id)); }}
                              className="table-row-hover"
                              style={{
                                background: '#fff', borderRadius: 8, border: '1px solid ' + brand.border, padding: '14px 18px',
                                cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                transition: 'all 0.15s',
                              }}
                            >
                              <div>
                                <p style={{ fontWeight: 600, color: brand.text, fontSize: 15, marginBottom: 4 }}>{w.name}</p>
                                <p style={{ fontSize: 13, color: brand.textLight }}>
                                  {hasSchedule ? `${activeDays} day${activeDays !== 1 ? 's' : ''} active` : 'No schedule set'}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                {DAY_NAMES.map((d, idx) => {
                                  const day = workerAvail[idx];
                                  const active = day.is_active && !day.isNew;
                                  return (
                                    <div key={idx} style={{
                                      width: 28, height: 28, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      background: active ? '#dcfce7' : day.isNew ? '#f3f4f6' : '#fee2e2',
                                      fontSize: 11, fontWeight: 600,
                                      color: active ? '#16a34a' : day.isNew ? brand.textLight : brand.danger,
                                    }}>
                                      {d.slice(0, 2)}
                                    </div>
                                  );
                                })}
                                <span style={{ marginLeft: 8, color: brand.textLight, fontSize: 18 }}>&#8250;</span>
                              </div>
                            </div>
                          );
                        })}
                        {workers.length === 0 && (
                          <div style={{ padding: 32, textAlign: 'center', color: brand.textLight, background: '#fff', borderRadius: 16, border: '1px solid #E8EDFC' }}>
                            No workers found. Add workers first in the Workers tab.
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button
                            onClick={() => { setSelectedWorkerAvail(''); setEditingAvailability(null); }}
                            style={{ ...buttonStyle, background: '#fff', color: brand.text, border: '1px solid ' + brand.border, padding: '6px 12px' }}
                          >
                            &larr; Back
                          </button>
                          <h2 style={{ fontSize: 18, fontWeight: 600, color: brand.text }}>
                            {workers.find(w => w.id === selectedWorkerAvail)?.name} — Weekly Schedule
                          </h2>
                        </div>
                      </div>

                      <div className="table-wrapper">
                        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                              <tr style={{ background: brand.bg }}>
                                <th style={thStyle}>Day</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Day Off</th>
                                <th style={thStyle}>Start Time</th>
                                <th style={thStyle}>End Time</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(editingAvailability || getWorkerAvailability(selectedWorkerAvail)).map((day, idx) => (
                                <tr key={idx} style={{ borderBottom: '1px solid ' + brand.border, opacity: day.is_active ? 1 : 0.5 }}>
                                  <td style={{ padding: '16px', fontWeight: 500, color: brand.text }}>{DAY_NAMES[idx]}</td>
                                  <td style={{ padding: '16px', textAlign: 'center' }}>
                                    <input
                                      type="checkbox"
                                      checked={!day.is_active}
                                      onChange={(e) => {
                                        const updated = [...(editingAvailability || getWorkerAvailability(selectedWorkerAvail))];
                                        updated[idx] = { ...updated[idx], is_active: !e.target.checked };
                                        setEditingAvailability(updated);
                                      }}
                                      style={{ width: 18, height: 18, cursor: 'pointer' }}
                                    />
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <select
                                      value={day.start_time?.slice(0, 5) || '09:00'}
                                      onChange={(e) => {
                                        const updated = [...(editingAvailability || getWorkerAvailability(selectedWorkerAvail))];
                                        updated[idx] = { ...updated[idx], start_time: e.target.value };
                                        setEditingAvailability(updated);
                                      }}
                                      disabled={!day.is_active}
                                      style={{ ...inputStyle, width: 150 }}
                                    >
                                      {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                    </select>
                                  </td>
                                  <td style={{ padding: '12px 16px' }}>
                                    <select
                                      value={day.end_time?.slice(0, 5) || '16:00'}
                                      onChange={(e) => {
                                        const updated = [...(editingAvailability || getWorkerAvailability(selectedWorkerAvail))];
                                        updated[idx] = { ...updated[idx], end_time: e.target.value };
                                        setEditingAvailability(updated);
                                      }}
                                      disabled={!day.is_active}
                                      style={{ ...inputStyle, width: 150 }}
                                    >
                                      {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                    </select>
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
                          style={{ ...buttonStyle, background: brand.navy, color: '#fff', opacity: availSaving ? 0.6 : 1 }}
                        >
                          {availSaving ? 'Saving...' : 'Save Schedule'}
                        </button>
                        <button
                          onClick={() => { setSelectedWorkerAvail(''); setEditingAvailability(null); }}
                          style={{ ...buttonStyle, background: '#fff', color: brand.text, border: '1px solid ' + brand.border }}
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
                      <div style={{ background: '#fff', borderRadius: 8, border: '1px solid ' + brand.border, padding: 16, marginBottom: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                          <button onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, padding: '5px 12px', border: '1px solid ' + brand.border }}>&lt;</button>
                          <span style={{ fontSize: 16, fontWeight: 600, color: brand.text }}>{MONTH_NAMES[calendarMonth]} {calendarYear}</span>
                          <button onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); }} style={{ ...buttonStyle, background: '#fff', color: brand.text, padding: '5px 12px', border: '1px solid ' + brand.border }}>&gt;</button>
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
                        <div style={{ background: '#fff', borderRadius: 8, border: '1px solid ' + brand.border, padding: 16 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: brand.text, marginBottom: 12 }}>
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
                          <button onClick={handleAddBlockedDate} style={{ ...buttonStyle, background: brand.danger, color: '#fff' }}>
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
                      <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
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
                              <button onClick={() => handleDeleteBlockedDate(bd.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger, fontSize: 12, padding: '5px 10px' }}>
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
                  <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, padding: 20, marginBottom: 24 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 14 }}>Add Schedule Override</p>
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
                    <button onClick={handleAddOverride} style={{ ...buttonStyle, background: brand.navy, color: '#fff', marginTop: 14 }}>
                      + Add Override
                    </button>
                  </div>

                  {/* Overrides List */}
                  <div className="table-wrapper">
                    <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: brand.bg }}>
                            <th style={thStyle}>Worker</th>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Hours</th>
                            <th style={thStyle}>Status</th>
                            <th style={thStyle}>Reason</th>
                            <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduleOverrides
                            .sort((a, b) => a.override_date.localeCompare(b.override_date))
                            .map(so => (
                              <tr key={so.id} style={{ borderBottom: '1px solid ' + brand.border }}>
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
                                  <button onClick={() => handleDeleteOverride(so.id)} style={{ ...buttonStyle, background: '#FEF2F2', color: brand.danger, fontSize: 12, padding: '5px 10px' }}>
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

            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: brand.text, letterSpacing: '-0.02em', marginBottom: 24 }}>Settings</h1>
              <div style={{ background: '#fff', borderRadius: 10, border: '1px solid ' + brand.border, padding: 24, maxWidth: 600 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 20 }}>Scheduling Configuration</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {[
                    { key: 'slot_duration_minutes', label: 'Slot Duration', description: 'Length of each booking time slot', options: SLOT_DURATION_OPTIONS },
                    { key: 'buffer_between_jobs_minutes', label: 'Buffer Between Jobs', description: 'Break time between consecutive bookings', options: BUFFER_OPTIONS },
                    { key: 'minimum_notice_hours', label: 'Minimum Notice', description: 'Minimum hours before a booking can be made', options: NOTICE_OPTIONS },
                    { key: 'advance_booking_days', label: 'How Far in Advance', description: 'How far in advance customers can book', options: ADVANCE_OPTIONS },
                  ].map(setting => (
                    <div key={setting.key} style={{ padding: '16px 0', borderBottom: `1px solid ${brand.border}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <div style={{ flex: 1, minWidth: 200 }}>
                          <p style={{ fontSize: 14, fontWeight: 500, color: brand.text }}>{setting.label}</p>
                          <p style={{ fontSize: 12, color: brand.textLight, marginTop: 2 }}>{setting.description}</p>
                        </div>
                        <select
                          value={editingSettings ? (editingSettings[setting.key] || '') : (serviceSettings[setting.key] || '')}
                          onChange={(e) => {
                            if (!editingSettings) {
                              setEditingSettings({ ...serviceSettings, [setting.key]: e.target.value });
                            } else {
                              setEditingSettings({ ...editingSettings, [setting.key]: e.target.value });
                            }
                          }}
                          style={{ ...inputStyle, width: 180 }}
                        >
                          {setting.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                  <button
                    onClick={handleSaveServiceSettings}
                    disabled={availSaving || !editingSettings}
                    style={{ ...buttonStyle, background: brand.navy, color: '#fff', opacity: (availSaving || !editingSettings) ? 0.6 : 1 }}
                  >
                    {availSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                  {editingSettings && (
                    <button onClick={() => setEditingSettings(null)} style={{ ...buttonStyle, background: '#fff', color: brand.text, border: '1px solid ' + brand.border }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
