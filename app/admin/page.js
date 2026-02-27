'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/useAuth';
import './admin.css';

// ─── SVG Icon Components ────────────────────────────────────────────
const Icons = {
  bookings: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  calendar: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01"/></svg>,
  customers: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  buildings: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>,
  neighborhoods: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
  floorplans: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M2 12h10"/><path d="M12 2v10"/><path d="M17 2v20"/></svg>,
  unitlines: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>,
  workers: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  availability: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  frequencies: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/></svg>,
  addons: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  settings: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  search: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  edit: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  archive: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21,8 21,21 3,21 3,8"/><rect x="1" y="3" width="22" height="5" rx="1"/><line x1="10" y1="12" x2="14" y2="12"/></svg>,
  check: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20,6 9,17 4,12"/></svg>,
  x: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  chevronDown: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6,9 12,15 18,9"/></svg>,
  chevronRight: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9,18 15,12 9,6"/></svg>,
  plus: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  menu: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  arrowLeft: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/></svg>,
  skip: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5,4 15,12 5,20"/><line x1="19" y1="5" x2="19" y2="19"/></svg>,
  dollar: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  logout: (p) => <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

// ─── Slide Panel Component ──────────────────────────────────────────
function SlidePanel({ open, onClose, title, children, footer }) {
  return (
    <>
      <div className={`admin-slide-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <div className={`admin-slide-panel ${open ? 'open' : ''}`}>
        <div className="admin-slide-header">
          <span className="admin-slide-title">{title}</span>
          <button className="admin-slide-close" onClick={onClose}>
            <Icons.x width={18} height={18} />
          </button>
        </div>
        <div className="admin-slide-body">{children}</div>
        {footer && <div className="admin-slide-footer">{footer}</div>}
      </div>
    </>
  );
}


// ─── Constants ──────────────────────────────────────────────────────
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

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

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const NAV_ITEMS = [
  { group: 'Operations', items: [
    { id: 'bookings', label: 'Bookings', icon: 'bookings' },
    { id: 'customers', label: 'Customers', icon: 'customers' },
  ]},
  { group: 'Properties', items: [
    { id: 'buildings', label: 'Buildings', icon: 'buildings' },
    { id: 'neighborhoods', label: 'Neighborhoods', icon: 'neighborhoods' },
    { id: 'floorplans', label: 'Floor Plans', icon: 'floorplans' },
    { id: 'unitlines', label: 'Unit Lines', icon: 'unitlines' },
  ]},
  { group: 'Team', items: [
    { id: 'workers', label: 'Workers', icon: 'workers' },
    { id: 'availability', label: 'Availability', icon: 'availability' },
  ]},
  { group: 'Configuration', items: [
    { id: 'frequencies', label: 'Frequencies', icon: 'frequencies' },
    { id: 'addons', label: 'Add-Ons', icon: 'addons' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]},
];

// ─── Main Component ─────────────────────────────────────────────────
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

  const [searchNeighborhoods, setSearchNeighborhoods] = useState('');
  const [searchBuildings, setSearchBuildings] = useState('');
  const [searchFloorPlans, setSearchFloorPlans] = useState('');
  const [searchUnitLines, setSearchUnitLines] = useState('');
  const [searchAddOns, setSearchAddOns] = useState('');
  const [searchWorkers, setSearchWorkers] = useState('');
  const [searchFrequencies, setSearchFrequencies] = useState('');
  const [searchBookings, setSearchBookings] = useState('');

  const [availabilitySubTab, setAvailabilitySubTab] = useState('weekly');
  const [availability, setAvailability] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);
  const [scheduleOverrides, setScheduleOverrides] = useState([]);
  const [serviceSettings, setServiceSettings] = useState({});
  const [selectedWorkerAvail, setSelectedWorkerAvail] = useState('');
  const [editingAvailability, setEditingAvailability] = useState(null);
  const [availSaving, setAvailSaving] = useState(false);

  const [blockedDateForm, setBlockedDateForm] = useState({ worker_id: '', blocked_date: '', all_day: true, start_time: '09:00', end_time: '16:00', reason: '' });
  const [overrideForm, setOverrideForm] = useState({ worker_id: '', override_date: '', start_time: '09:00', end_time: '16:00', is_available: true, reason: '' });
  const [editingSettings, setEditingSettings] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [chargingBookingId, setChargingBookingId] = useState(null);
  const [crudError, setCrudError] = useState('');

  // Slide panel state for editing
  const [slideOpen, setSlideOpen] = useState(false);
  const [slideType, setSlideType] = useState('');
  const [slideData, setSlideData] = useState({});
  const [slideSaving, setSlideSaving] = useState(false);

  // Expanded booking row
  const [expandedBookingId, setExpandedBookingId] = useState(null);


  // ─── Data Loading ───────────────────────────────────────────────────
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
    const allSettings = svcRes.data || [];
    const addonVisible = allSettings.find(s => s.key === 'addons_section_visible');
    if (addonVisible) setAddonsSectionVisible(addonVisible.value === 'true');
    const settingsObj = {};
    allSettings.forEach(s => { settingsObj[s.key] = s.value; });
    setServiceSettings(settingsObj);
    setDataLoading(false);
  };

  // ─── Helpers ────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFrequencyName = (frequencyId) => {
    return frequencies.find(f => f.id === frequencyId)?.name || '';
  };

  const formatDateISO = (d) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const getCalendarDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    let startPad = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = startPad; i > 0; i--) {
      const d = new Date(year, month, 1 - i);
      days.push({ date: d, isCurrentMonth: false });
    }
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    while (days.length % 7 !== 0) {
      const d = new Date(year, month + 1, days.length - startPad - lastDay.getDate() + 1);
      days.push({ date: d, isCurrentMonth: false });
    }
    return days;
  };

  // ─── CRUD Handlers ──────────────────────────────────────────────────
  const handleAdd = async (type) => {
    setCrudError('');
    let result;
    switch (type) {
      case 'neighborhoods':
        result = await supabase.from('neighborhoods').insert({ name: 'New Neighborhood' }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setNeighborhoods([...neighborhoods, result.data]); openSlide('neighborhoods', result.data); }
        break;
      case 'buildings':
        result = await supabase.from('buildings').insert({ name: 'New Building', address: '', neighborhood_id: neighborhoods[0]?.id }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setBuildings([...buildings, result.data]); openSlide('buildings', result.data); }
        break;
      case 'floorplans':
        result = await supabase.from('floor_plans').insert({ name: 'New Floor Plan', price: 0, duration_minutes: 60, building_id: buildings[0]?.id }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setFloorPlans([...floorPlans, result.data]); openSlide('floorplans', result.data); }
        break;
      case 'unitlines': {
        const defaultBuilding = selectedBuildingUL || buildings[0]?.id;
        const buildingPlans = floorPlans.filter(fp => fp.building_id === defaultBuilding);
        result = await supabase.from('unit_lines').insert({ building_id: defaultBuilding, line_number: '01', floor_min: 1, floor_max: 99, floor_plan_id: buildingPlans[0]?.id || null, custom_price: null }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setUnitLines([...unitLines, result.data]); openSlide('unitlines', result.data); }
        break;
      }
      case 'addons':
        result = await supabase.from('add_ons').insert({ name: 'New Add-On', price: 0 }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setAddOns([...addOns, result.data]); openSlide('addons', result.data); }
        break;
      case 'workers':
        result = await supabase.from('workers').insert({ name: 'New Worker', email: '', phone: '' }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setWorkers([...workers, result.data]); openSlide('workers', result.data); }
        break;
      case 'frequencies': {
        const maxSort = frequencies.reduce((max, f) => Math.max(max, f.sort_order || 0), 0);
        result = await supabase.from('frequencies').insert({ name: 'New Frequency', discount_percent: 0, interval_days: 0, sort_order: maxSort + 1 }).select().single();
        if (result.error) { setCrudError('Failed to add: ' + result.error.message); return; }
        if (result.data) { setFrequencies([...frequencies, result.data]); openSlide('frequencies', result.data); }
        break;
      }
    }
  };

  const openSlide = (type, item) => {
    setSlideType(type);
    setSlideData({ ...item });
    setSlideOpen(true);
  };

  const handleSlideSave = async () => {
    setCrudError('');
    setSlideSaving(true);
    let result;
    const id = slideData.id;
    switch (slideType) {
      case 'neighborhoods':
        result = await supabase.from('neighborhoods').update({ name: slideData.name }).eq('id', id);
        if (!result.error) setNeighborhoods(neighborhoods.map(n => n.id === id ? { ...n, name: slideData.name } : n));
        break;
      case 'buildings':
        result = await supabase.from('buildings').update({ name: slideData.name, address: slideData.address, neighborhood_id: slideData.neighborhood_id }).eq('id', id);
        if (!result.error) setBuildings(buildings.map(b => b.id === id ? { ...b, name: slideData.name, address: slideData.address, neighborhood_id: slideData.neighborhood_id } : b));
        break;
      case 'floorplans':
        result = await supabase.from('floor_plans').update({ name: slideData.name, price: slideData.price, duration_minutes: slideData.duration_minutes, building_id: slideData.building_id }).eq('id', id);
        if (!result.error) setFloorPlans(floorPlans.map(f => f.id === id ? { ...f, ...slideData } : f));
        break;
      case 'unitlines': {
        const payload = { building_id: slideData.building_id, line_number: slideData.line_number, floor_min: slideData.floor_min, floor_max: slideData.floor_max, floor_plan_id: slideData.floor_plan_id || null, custom_price: slideData.custom_price === '' || slideData.custom_price === null ? null : Number(slideData.custom_price) };
        result = await supabase.from('unit_lines').update(payload).eq('id', id);
        if (!result.error) setUnitLines(unitLines.map(ul => ul.id === id ? { ...ul, ...payload } : ul));
        break;
      }
      case 'addons':
        result = await supabase.from('add_ons').update({ name: slideData.name, price: slideData.price }).eq('id', id);
        if (!result.error) setAddOns(addOns.map(a => a.id === id ? { ...a, name: slideData.name, price: slideData.price } : a));
        break;
      case 'workers':
        result = await supabase.from('workers').update({ name: slideData.name, email: slideData.email, phone: slideData.phone }).eq('id', id);
        if (!result.error) setWorkers(workers.map(w => w.id === id ? { ...w, name: slideData.name, email: slideData.email, phone: slideData.phone } : w));
        break;
      case 'frequencies':
        result = await supabase.from('frequencies').update({ name: slideData.name, discount_percent: slideData.discount_percent, interval_days: slideData.interval_days, sort_order: slideData.sort_order }).eq('id', id);
        if (!result.error) setFrequencies(frequencies.map(f => f.id === id ? { ...f, ...slideData } : f));
        break;
      case 'booking':
        result = await supabase.from('bookings').update({ booking_date: slideData.booking_date, booking_time: slideData.booking_time, worker_id: slideData.worker_id || null, unit_number: slideData.unit_number, special_instructions: slideData.special_instructions }).eq('id', id);
        if (!result.error) setBookings(bookings.map(b => b.id === id ? { ...b, ...slideData } : b));
        break;
    }
    if (result?.error) {
      setCrudError('Failed to save: ' + result.error.message);
    } else {
      setSlideOpen(false);
    }
    setSlideSaving(false);
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    setCrudError('');
    const tableMap = { neighborhoods: 'neighborhoods', buildings: 'buildings', floorplans: 'floor_plans', unitlines: 'unit_lines', addons: 'add_ons', workers: 'workers', frequencies: 'frequencies' };
    const { error: deleteError } = await supabase.from(tableMap[type]).delete().eq('id', id);
    if (deleteError) { setCrudError('Failed to delete: ' + deleteError.message); return; }
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
      neighborhoods: [neighborhoods, setNeighborhoods], buildings: [buildings, setBuildings],
      floorplans: [floorPlans, setFloorPlans], unitlines: [unitLines, setUnitLines],
      addons: [addOns, setAddOns], workers: [workers, setWorkers], frequencies: [frequencies, setFrequencies],
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


  // ─── Availability Handlers ──────────────────────────────────────────
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
        const payload = { worker_id: workerId, day_of_week: day.day_of_week, start_time: day.start_time, end_time: day.end_time, is_active: day.is_active };
        const existing = availability.find(a => a.worker_id === workerId && a.day_of_week === day.day_of_week);
        if (existing) {
          const { error } = await supabase.from('availability').update(payload).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('availability').insert(payload);
          if (error) throw error;
        }
      }
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
    if (!blockedDateForm.worker_id || !blockedDateForm.blocked_date) { setCrudError('Please select a worker and date.'); return; }
    const payload = { worker_id: blockedDateForm.worker_id, blocked_date: blockedDateForm.blocked_date, all_day: blockedDateForm.all_day, start_time: blockedDateForm.all_day ? null : blockedDateForm.start_time, end_time: blockedDateForm.all_day ? null : blockedDateForm.end_time, reason: blockedDateForm.reason };
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
    if (!overrideForm.worker_id || !overrideForm.override_date) { setCrudError('Please select a worker and date.'); return; }
    const payload = { worker_id: overrideForm.worker_id, override_date: overrideForm.override_date, start_time: overrideForm.start_time, end_time: overrideForm.end_time, is_available: overrideForm.is_available, reason: overrideForm.reason };
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

  // ─── Booking Handlers ──────────────────────────────────────────────
  const handleChargeBooking = async (bookingId) => {
    if (!confirm('Charge this booking now? The customer\'s saved card will be charged.')) return;
    setChargingBookingId(bookingId);
    try {
      const res = await fetch('/api/charge-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ booking_id: bookingId }) });
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
    const bookingIds = customerBookings.map(b => b.id);
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from('bookings').update(updates).in('id', bookingIds);
      if (error) { setCrudError('Failed to update customer info: ' + error.message); return; }
      setBookings(bookings.map(b => bookingIds.includes(b.id) ? { ...b, ...updates } : b));
    }
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

  // ─── Sorting & Filtering ───────────────────────────────────────────
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortIndicator = (field) => sortField === field ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : '';

  const filteredBookings = bookings.filter(b => {
    if (b.status === 'cancelled' && !showCancelled) return false;
    if (b.status === 'skipped' && !showSkipped) return false;
    if (searchBookings) {
      const s = searchBookings.toLowerCase();
      const workerName = (workers.find(w => w.id === b.worker_id)?.name || '').toLowerCase();
      if (!(b.customer_name || '').toLowerCase().includes(s) && !(b.customer_email || '').toLowerCase().includes(s) && !(b.building || '').toLowerCase().includes(s) && !(b.unit_number || '').toLowerCase().includes(s) && !(b.status || '').toLowerCase().includes(s) && !workerName.includes(s)) return false;
    }
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    const dir = sortDirection === 'asc' ? 1 : -1;
    let aVal, bVal;
    switch (sortField) {
      case 'customer_name': aVal = (a.customer_name || '').toLowerCase(); bVal = (b.customer_name || '').toLowerCase(); return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'building': aVal = (a.building || '').toLowerCase(); bVal = (b.building || '').toLowerCase(); return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'booking_date': aVal = a.booking_date || ''; bVal = b.booking_date || ''; return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'total_price': aVal = Number(a.total_price) || 0; bVal = Number(b.total_price) || 0; return (aVal - bVal) * dir;
      case 'status': aVal = (a.status || '').toLowerCase(); bVal = (b.status || '').toLowerCase(); return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'payment_status': aVal = (a.payment_status || '').toLowerCase(); bVal = (b.payment_status || '').toLowerCase(); return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      case 'worker_id': aVal = (workers.find(w => w.id === a.worker_id)?.name || 'zzz').toLowerCase(); bVal = (workers.find(w => w.id === b.worker_id)?.name || 'zzz').toLowerCase(); return aVal < bVal ? -dir : aVal > bVal ? dir : 0;
      default: return 0;
    }
  });

  const filteredNeighborhoods = neighborhoods.filter(n => { if (!showArchivedNeighborhoods && n.archived) return false; if (searchNeighborhoods && !(n.name || '').toLowerCase().includes(searchNeighborhoods.toLowerCase())) return false; return true; });
  const filteredBuildings = buildings.filter(b => { if (!showArchivedBuildings && b.archived) return false; if (selectedNeighborhood && b.neighborhood_id !== selectedNeighborhood) return false; if (searchBuildings) { const s = searchBuildings.toLowerCase(); const nName = (neighborhoods.find(n => n.id === b.neighborhood_id)?.name || '').toLowerCase(); if (!(b.name || '').toLowerCase().includes(s) && !(b.address || '').toLowerCase().includes(s) && !nName.includes(s)) return false; } return true; });
  const filteredFloorPlans = floorPlans.filter(f => { if (!showArchivedFloorPlans && f.archived) return false; if (selectedBuilding && f.building_id !== selectedBuilding) return false; if (searchFloorPlans) { const s = searchFloorPlans.toLowerCase(); const bName = (buildings.find(b => b.id === f.building_id)?.name || '').toLowerCase(); if (!(f.name || '').toLowerCase().includes(s) && !bName.includes(s)) return false; } return true; });
  const filteredUnitLines = unitLines.filter(ul => { if (!showArchivedUnitLines && ul.archived) return false; if (selectedBuildingUL && ul.building_id !== selectedBuildingUL) return false; if (searchUnitLines) { const s = searchUnitLines.toLowerCase(); const bName = (buildings.find(b => b.id === ul.building_id)?.name || '').toLowerCase(); const fpName = (floorPlans.find(f => f.id === ul.floor_plan_id)?.name || '').toLowerCase(); if (!(ul.line_number || '').toLowerCase().includes(s) && !bName.includes(s) && !fpName.includes(s)) return false; } return true; });
  const filteredWorkers = workers.filter(w => { if (!showArchivedWorkers && w.archived) return false; if (searchWorkers) { const s = searchWorkers.toLowerCase(); if (!(w.name || '').toLowerCase().includes(s) && !(w.email || '').toLowerCase().includes(s) && !(w.phone || '').toLowerCase().includes(s)) return false; } return true; });
  const filteredFrequenciesList = frequencies.filter(f => { if (!showArchivedFrequencies && f.archived) return false; if (searchFrequencies && !(f.name || '').toLowerCase().includes(searchFrequencies.toLowerCase())) return false; return true; });
  const filteredAddOnsList = addOns.filter(a => { if (!showArchivedAddOns && a.archived) return false; if (searchAddOns && !(a.name || '').toLowerCase().includes(searchAddOns.toLowerCase())) return false; return true; });

  const handleLogout = async () => { await signOut(); router.push('/login'); };

  // ─── Stats ──────────────────────────────────────────────────────────
  const today = formatDateISO(new Date());
  const todaysBookings = bookings.filter(b => b.booking_date === today && !['cancelled', 'skipped'].includes(b.status));
  const pendingPayments = bookings.filter(b => b.payment_status === 'pending' && !['cancelled', 'skipped'].includes(b.status));
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekRevenue = bookings.filter(b => b.booking_date >= formatDateISO(weekStart) && b.payment_status === 'paid').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0);
  const upcomingCount = bookings.filter(b => ['upcoming', 'scheduled'].includes(b.status)).length;


  // ─── Loading State ──────────────────────────────────────────────────
  if (authLoading || dataLoading) {
    return (
      <div className="admin-loading">
        <div style={{ textAlign: 'center' }}>
          <div className="admin-spinner" />
          <p style={{ color: 'var(--av-text-muted)', fontSize: 14 }}>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  // ─── Slide Panel Forms ──────────────────────────────────────────────
  const renderSlideForm = () => {
    switch (slideType) {
      case 'neighborhoods':
        return (
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form-group">
              <label className="admin-label">Name</label>
              <input className="admin-input" value={slideData.name || ''} onChange={(e) => setSlideData({ ...slideData, name: e.target.value })} />
            </div>
          </div>
        );
      case 'buildings':
        return (
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form-group">
              <label className="admin-label">Name</label>
              <input className="admin-input" value={slideData.name || ''} onChange={(e) => setSlideData({ ...slideData, name: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Address</label>
              <input className="admin-input" value={slideData.address || ''} onChange={(e) => setSlideData({ ...slideData, address: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Neighborhood</label>
              <select className="admin-select" value={slideData.neighborhood_id || ''} onChange={(e) => setSlideData({ ...slideData, neighborhood_id: e.target.value })}>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>
          </div>
        );
      case 'floorplans':
        return (
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form-group">
              <label className="admin-label">Name</label>
              <input className="admin-input" value={slideData.name || ''} onChange={(e) => setSlideData({ ...slideData, name: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Building</label>
              <select className="admin-select" value={slideData.building_id || ''} onChange={(e) => setSlideData({ ...slideData, building_id: e.target.value })}>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="admin-form-group">
                <label className="admin-label">Price ($)</label>
                <input className="admin-input" type="number" value={slideData.price || 0} onChange={(e) => setSlideData({ ...slideData, price: Number(e.target.value) })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Duration (minutes)</label>
                <input className="admin-input" type="number" min="15" step="15" value={slideData.duration_minutes || 60} onChange={(e) => setSlideData({ ...slideData, duration_minutes: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        );
      case 'unitlines':
        return (
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form-group">
              <label className="admin-label">Building</label>
              <select className="admin-select" value={slideData.building_id || ''} onChange={(e) => setSlideData({ ...slideData, building_id: e.target.value })}>
                {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Line Number</label>
              <input className="admin-input" value={slideData.line_number || ''} onChange={(e) => setSlideData({ ...slideData, line_number: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="admin-form-group">
                <label className="admin-label">Floor Min</label>
                <input className="admin-input" type="number" min="1" value={slideData.floor_min || 1} onChange={(e) => setSlideData({ ...slideData, floor_min: Number(e.target.value) })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Floor Max</label>
                <input className="admin-input" type="number" min="1" value={slideData.floor_max || 99} onChange={(e) => setSlideData({ ...slideData, floor_max: Number(e.target.value) })} />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Floor Plan</label>
              <select className="admin-select" value={slideData.floor_plan_id || ''} onChange={(e) => setSlideData({ ...slideData, floor_plan_id: e.target.value })}>
                <option value="">— None —</option>
                {floorPlans.filter(f => f.building_id === slideData.building_id).map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Custom Price ($) — leave blank to use floor plan price</label>
              <input className="admin-input" type="number" placeholder="Use floor plan price" value={slideData.custom_price ?? ''} onChange={(e) => setSlideData({ ...slideData, custom_price: e.target.value })} />
            </div>
          </div>
        );
      case 'addons':
        return (
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form-group">
              <label className="admin-label">Name</label>
              <input className="admin-input" value={slideData.name || ''} onChange={(e) => setSlideData({ ...slideData, name: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Price ($)</label>
              <input className="admin-input" type="number" value={slideData.price || 0} onChange={(e) => setSlideData({ ...slideData, price: Number(e.target.value) })} />
            </div>
          </div>
        );
      case 'workers':
        return (
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form-group">
              <label className="admin-label">Name</label>
              <input className="admin-input" value={slideData.name || ''} onChange={(e) => setSlideData({ ...slideData, name: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Email</label>
              <input className="admin-input" type="email" value={slideData.email || ''} onChange={(e) => setSlideData({ ...slideData, email: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Phone</label>
              <input className="admin-input" type="tel" value={slideData.phone || ''} onChange={(e) => setSlideData({ ...slideData, phone: e.target.value })} />
            </div>
          </div>
        );
      case 'frequencies':
        return (
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="admin-form-group">
              <label className="admin-label">Name</label>
              <input className="admin-input" value={slideData.name || ''} onChange={(e) => setSlideData({ ...slideData, name: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="admin-form-group">
                <label className="admin-label">Discount %</label>
                <input className="admin-input" type="number" value={slideData.discount_percent ?? 0} onChange={(e) => setSlideData({ ...slideData, discount_percent: Number(e.target.value) })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Interval (days)</label>
                <input className="admin-input" type="number" value={slideData.interval_days ?? 0} onChange={(e) => setSlideData({ ...slideData, interval_days: Number(e.target.value) })} />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Sort Order</label>
              <input className="admin-input" type="number" value={slideData.sort_order ?? 0} onChange={(e) => setSlideData({ ...slideData, sort_order: Number(e.target.value) })} />
            </div>
          </div>
        );
      case 'booking':
        return (
          <div className="admin-form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="admin-form-group">
                <label className="admin-label">Date</label>
                <input className="admin-input" type="date" value={slideData.booking_date || ''} onChange={(e) => setSlideData({ ...slideData, booking_date: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Time</label>
                <input className="admin-input" value={slideData.booking_time || ''} onChange={(e) => setSlideData({ ...slideData, booking_time: e.target.value })} placeholder="e.g. 9:00 AM" />
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Unit Number</label>
              <input className="admin-input" value={slideData.unit_number || ''} onChange={(e) => setSlideData({ ...slideData, unit_number: e.target.value })} />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Worker</label>
              <select className="admin-select" value={slideData.worker_id || ''} onChange={(e) => setSlideData({ ...slideData, worker_id: e.target.value })}>
                <option value="">Unassigned</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Special Instructions</label>
              <textarea className="admin-input" rows={3} value={slideData.special_instructions || ''} onChange={(e) => setSlideData({ ...slideData, special_instructions: e.target.value })} style={{ resize: 'vertical' }} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const slideTitle = {
    neighborhoods: 'Edit Neighborhood',
    buildings: 'Edit Building',
    floorplans: 'Edit Floor Plan',
    unitlines: 'Edit Unit Line',
    addons: 'Edit Add-On',
    workers: 'Edit Worker',
    frequencies: 'Edit Frequency',
    booking: 'Edit Booking',
  }[slideType] || 'Edit';


  // ─── Render ─────────────────────────────────────────────────────────
  return (
    <div className="admin-shell">
      {/* ── Topbar ── */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <button className="admin-sidebar-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <Icons.menu width={20} height={20} />
          </button>
          <div className="admin-topbar-logo"><span /><span /><span /></div>
          <span className="admin-topbar-brand">BetterView</span>
          <span className="admin-topbar-badge">ADMIN</span>
        </div>
        <div className="admin-topbar-right">
          <Link href="/admin/calendar" className="admin-topbar-btn">
            <Icons.calendar className="admin-nav-icon" style={{ width: 14, height: 14, opacity: 1 }} />
            Calendar
          </Link>
          <span className="admin-topbar-email">{user?.email}</span>
          <button onClick={handleLogout} className="admin-topbar-btn">
            <Icons.logout className="admin-nav-icon" style={{ width: 14, height: 14, opacity: 1 }} />
            Log Out
          </button>
        </div>
      </header>

      <div className="admin-body">
        {/* ── Sidebar ── */}
        <nav className={`admin-sidebar-nav ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          {NAV_ITEMS.map((group, gi) => (
            <div key={group.group} className="admin-nav-group">
              <div className="admin-nav-group-label">{group.group}</div>
              {group.items.map(item => {
                const Icon = Icons[item.icon];
                return (
                  <button
                    key={item.id}
                    className={`admin-nav-item ${activeTab === item.id ? 'active' : ''}`}
                    onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
                  >
                    {Icon && <Icon className="admin-nav-icon" />}
                    {item.label}
                  </button>
                );
              })}
              {gi < NAV_ITEMS.length - 1 && <div className="admin-nav-divider" />}
            </div>
          ))}
        </nav>

        {/* ── Main Content ── */}
        <main className="admin-content">
          {crudError && (
            <div className="admin-error-toast">
              <span>{crudError}</span>
              <button onClick={() => setCrudError('')}>&times;</button>
            </div>
          )}

          {/* ═══ BOOKINGS TAB ═══ */}
          {activeTab === 'bookings' && (
            <div>
              {/* Stats */}
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Today&apos;s Bookings</div>
                  <div className="admin-stat-value">{todaysBookings.length}</div>
                  <div className="admin-stat-sub">{formatDate(today)}</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Pending Payments</div>
                  <div className="admin-stat-value">{pendingPayments.length}</div>
                  <div className="admin-stat-sub">awaiting charge</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">This Week&apos;s Revenue</div>
                  <div className="admin-stat-value">${weekRevenue.toFixed(0)}</div>
                  <div className="admin-stat-sub">from paid bookings</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-label">Upcoming</div>
                  <div className="admin-stat-value">{upcomingCount}</div>
                  <div className="admin-stat-sub">scheduled bookings</div>
                </div>
              </div>

              <div className="admin-page-header">
                <div>
                  <h1 className="admin-page-title">Bookings</h1>
                  <p className="admin-page-subtitle">{sortedBookings.length} booking{sortedBookings.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {/* Filters */}
              <div className="admin-filter-bar">
                <div className="admin-search-wrap">
                  <Icons.search />
                  <input className="admin-search-input" placeholder="Search bookings..." value={searchBookings} onChange={(e) => setSearchBookings(e.target.value)} />
                </div>
                <label className="admin-filter-check">
                  <input type="checkbox" checked={showCancelled} onChange={(e) => setShowCancelled(e.target.checked)} />
                  Show Cancelled
                </label>
                <label className="admin-filter-check">
                  <input type="checkbox" checked={showSkipped} onChange={(e) => setShowSkipped(e.target.checked)} />
                  Show Skipped
                </label>
              </div>

              {/* Table */}
              <div className="admin-table-wrap">
                <div className="admin-table-scroll">
                  <table className="admin-table" style={{ minWidth: 900 }}>
                    <thead>
                      <tr>
                        <th style={{ width: 30 }}></th>
                        {[
                          { field: 'customer_name', label: 'Customer' },
                          { field: 'building', label: 'Property' },
                          { field: 'booking_date', label: 'Date' },
                          { field: 'total_price', label: 'Amount' },
                          { field: 'status', label: 'Status' },
                          { field: 'payment_status', label: 'Payment' },
                          { field: 'worker_id', label: 'Worker' },
                        ].map(col => (
                          <th key={col.field} className="sortable" onClick={() => handleSort(col.field)}>
                            {col.label}{sortIndicator(col.field)}
                          </th>
                        ))}
                        <th className="text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedBookings.map(booking => {
                        const freqName = getFrequencyName(booking.frequency_id);
                        const isActionable = ['upcoming', 'scheduled'].includes(booking.status);
                        const isExpanded = expandedBookingId === booking.id;
                        return (
                          <React.Fragment key={booking.id}>
                            <tr style={{ cursor: 'pointer' }} className={isExpanded ? 'expanded' : ''} onClick={() => setExpandedBookingId(isExpanded ? null : booking.id)}>
                              <td><span className={`admin-expand-arrow ${isExpanded ? 'open' : ''}`}>▶</span></td>
                              <td>
                                <div className="cell-primary">{booking.customer_name}</div>
                                <div className="cell-secondary">{booking.customer_email}</div>
                              </td>
                              <td>
                                <div className="cell-primary">{booking.building}</div>
                                <div className="cell-secondary">Unit {booking.unit_number}</div>
                              </td>
                              <td>
                                <div className="cell-primary">{formatDate(booking.booking_date)}</div>
                                <div className="cell-secondary">{booking.booking_time}</div>
                              </td>
                              <td><span style={{ fontWeight: 600 }}>${booking.total_price}</span></td>
                              <td><span className={`admin-pill ${booking.status}`}>{booking.status}</span></td>
                              <td><span className={`admin-pill ${booking.payment_status || 'pending'}`}>{booking.payment_status || 'n/a'}</span></td>
                              <td>
                                <select className="admin-filter-select" style={{ width: 120, fontSize: 12, padding: '4px 28px 4px 8px' }} value={booking.worker_id || ''} onClick={(e) => e.stopPropagation()} onChange={(e) => { e.stopPropagation(); handleWorkerAssign(booking.id, e.target.value); }}>
                                  <option value="">Unassigned</option>
                                  {workers.filter(w => !w.archived).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                                </select>
                              </td>
                              <td>
                                <div className="admin-actions" onClick={(e) => e.stopPropagation()}>
                                  <button className="admin-btn-icon" title="Edit" onClick={() => { openSlide('booking', { ...booking }); }}>
                                    <Icons.edit style={{ width: 15, height: 15 }} />
                                  </button>
                                  {isActionable && (
                                    <>
                                      <button className="admin-btn-icon" title="Complete" onClick={() => handleMarkComplete(booking.id)}>
                                        <Icons.check style={{ width: 15, height: 15, color: 'var(--av-success)' }} />
                                      </button>
                                      <button className="admin-btn-icon" title="Skip" onClick={() => handleSkipBooking(booking.id)}>
                                        <Icons.skip style={{ width: 15, height: 15, color: 'var(--av-warning)' }} />
                                      </button>
                                      <button className="admin-btn-icon danger" title="Cancel" onClick={() => handleCancelBooking(booking.id)}>
                                        <Icons.x style={{ width: 15, height: 15 }} />
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr>
                                <td colSpan={9} style={{ padding: 0 }}>
                                  <div style={{ padding: '16px 16px 16px 48px', background: 'var(--av-periwinkle-bg)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                    <div><span className="cell-secondary">Floor Plan</span><div className="cell-primary">{booking.floor_plan || '—'}</div></div>
                                    <div><span className="cell-secondary">Frequency</span><div className="cell-primary">{freqName || 'One-Time'}</div></div>
                                    <div><span className="cell-secondary">Recurring</span><div className="cell-primary">{booking.recurring_group_id ? 'Yes' : 'No'}</div></div>
                                    <div><span className="cell-secondary">Instructions</span><div className="cell-primary">{booking.special_instructions || 'None'}</div></div>
                                    {booking.payment_status === 'pending' && booking.stripe_customer_id && (
                                      <div>
                                        <button className="admin-btn admin-btn-success admin-btn-sm" disabled={chargingBookingId === booking.id} onClick={() => handleChargeBooking(booking.id)}>
                                          {chargingBookingId === booking.id ? 'Charging...' : 'Charge Now'}
                                        </button>
                                      </div>
                                    )}
                                    {booking.frequency_discount > 0 && (
                                      <div><span className="cell-secondary">Freq. Discount</span><div className="cell-primary">-${booking.frequency_discount}</div></div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                      {sortedBookings.length === 0 && (
                        <tr><td colSpan={9} className="admin-empty"><div className="admin-empty-text">No bookings match your search.</div></td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


          {/* ═══ CUSTOMERS TAB ═══ */}
          {activeTab === 'customers' && (() => {
            const customerMap = {};
            bookings.forEach(b => {
              const email = (b.customer_email || b.guest_email || '').toLowerCase().trim();
              if (!email) return;
              if (!customerMap[email]) {
                customerMap[email] = { email, name: b.customer_name || [b.guest_first_name, b.guest_last_name].filter(Boolean).join(' ') || '', user_id: b.user_id || null, bookings: [], totalSpent: 0, firstBooking: b.booking_date, lastBooking: b.booking_date };
              }
              const c = customerMap[email];
              c.bookings.push(b);
              if (!c.name && (b.customer_name || b.guest_first_name)) c.name = b.customer_name || [b.guest_first_name, b.guest_last_name].filter(Boolean).join(' ');
              if (!c.user_id && b.user_id) c.user_id = b.user_id;
              c.totalSpent += Number(b.total_price) || 0;
              if (b.booking_date < c.firstBooking) c.firstBooking = b.booking_date;
              if (b.booking_date > c.lastBooking) c.lastBooking = b.booking_date;
            });
            userProfiles.forEach(up => {
              const profileName = [up.first_name, up.last_name].filter(Boolean).join(' ');
              Object.values(customerMap).forEach(c => {
                if (c.user_id && c.user_id === up.user_id) {
                  if (profileName && !c.name) c.name = profileName;
                  c.phone = c.phone || up.phone || '';
                  c.hasAccount = true;
                }
              });
            });
            let customers = Object.values(customerMap);
            customers.forEach(c => { if (!c.hasAccount) c.hasAccount = false; });
            const search = customerSearch.toLowerCase().trim();
            if (search) customers = customers.filter(c => (c.name || '').toLowerCase().includes(search) || c.email.toLowerCase().includes(search) || (c.phone || '').includes(search));
            customers.sort((a, b) => (b.lastBooking || '').localeCompare(a.lastBooking || ''));

            return (
              <div>
                <div className="admin-page-header">
                  <div>
                    <h1 className="admin-page-title">Customers</h1>
                    <p className="admin-page-subtitle">{customers.length} customer{customers.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="admin-filter-bar">
                  <div className="admin-search-wrap">
                    <Icons.search />
                    <input className="admin-search-input" placeholder="Search by name, email, or phone..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} style={{ width: 280 }} />
                  </div>
                </div>
                <div className="admin-table-wrap">
                  <div className="admin-table-scroll">
                    <table className="admin-table" style={{ minWidth: 700 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 30 }}></th>
                          <th>Customer</th>
                          <th>Account</th>
                          <th>Bookings</th>
                          <th>Total Spent</th>
                          <th>Last Booking</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map(c => {
                          const isExpanded = expandedCustomer === c.email;
                          const completedCount = c.bookings.filter(b => b.status === 'completed').length;
                          const upcomingCount = c.bookings.filter(b => ['upcoming', 'scheduled'].includes(b.status)).length;
                          return (
                            <React.Fragment key={c.email}>
                              <tr onClick={() => setExpandedCustomer(isExpanded ? null : c.email)} style={{ cursor: 'pointer' }} className={isExpanded ? 'expanded' : ''}>
                                <td><span className={`admin-expand-arrow ${isExpanded ? 'open' : ''}`}>▶</span></td>
                                <td>
                                  <div className="cell-primary">{c.name || 'Unknown'}</div>
                                  <div className="cell-secondary">{c.email}</div>
                                  {c.phone && <div className="cell-secondary">{c.phone}</div>}
                                </td>
                                <td><span className={`admin-pill ${c.hasAccount ? 'registered' : 'guest'}`}>{c.hasAccount ? 'Registered' : 'Guest'}</span></td>
                                <td>
                                  <span style={{ fontWeight: 600 }}>{c.bookings.length}</span>
                                  <div className="cell-secondary">{upcomingCount} upcoming, {completedCount} done</div>
                                </td>
                                <td><span style={{ fontWeight: 600 }}>${c.totalSpent.toFixed(2)}</span></td>
                                <td>{formatDate(c.lastBooking)}</td>
                              </tr>
                              {isExpanded && (
                                <tr>
                                  <td colSpan={6} style={{ padding: 0 }}>
                                    <div className="admin-expand-content">
                                      {/* Customer Info */}
                                      <div className="admin-card" style={{ marginBottom: 16, marginTop: 8 }}>
                                        <div className="admin-card-header">
                                          <span className="admin-card-title">Customer Info</span>
                                          {editingCustomerEmail === c.email ? (
                                            <div style={{ display: 'flex', gap: 6 }}>
                                              <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={() => handleSaveCustomerInfo(c.email, c.bookings, c.user_id)}>Save</button>
                                              <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setEditingCustomerEmail(null); setEditingCustomerValue({}); }}>Cancel</button>
                                            </div>
                                          ) : (
                                            <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setEditingCustomerEmail(c.email); setEditingCustomerValue({ customer_name: c.name || '', customer_email: c.email, phone: c.phone || '' }); }}>Edit</button>
                                          )}
                                        </div>
                                        <div className="admin-form-grid">
                                          <div>
                                            <label className="admin-label">Name</label>
                                            {editingCustomerEmail === c.email ? (
                                              <input className="admin-input" value={editingCustomerValue.customer_name || ''} onChange={(e) => setEditingCustomerValue({ ...editingCustomerValue, customer_name: e.target.value })} />
                                            ) : (
                                              <p style={{ fontSize: 14, fontWeight: 500 }}>{c.name || 'Unknown'}</p>
                                            )}
                                          </div>
                                          <div>
                                            <label className="admin-label">Email</label>
                                            {editingCustomerEmail === c.email ? (
                                              <input className="admin-input" value={editingCustomerValue.customer_email || ''} onChange={(e) => setEditingCustomerValue({ ...editingCustomerValue, customer_email: e.target.value })} />
                                            ) : (
                                              <p style={{ fontSize: 14 }}>{c.email}</p>
                                            )}
                                          </div>
                                          <div>
                                            <label className="admin-label">Phone</label>
                                            {editingCustomerEmail === c.email ? (
                                              <input className="admin-input" value={editingCustomerValue.phone || ''} onChange={(e) => setEditingCustomerValue({ ...editingCustomerValue, phone: e.target.value })} placeholder="Enter phone..." />
                                            ) : (
                                              <p style={{ fontSize: 14, color: c.phone ? 'var(--av-text)' : 'var(--av-text-muted)' }}>{c.phone || 'Not provided'}</p>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      {/* Booking History */}
                                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Booking History ({c.bookings.length})</p>
                                      <div className="admin-table-wrap">
                                        <table className="admin-table">
                                          <thead><tr><th>Date</th><th>Property</th><th>Frequency</th><th>Total</th><th>Status</th><th>Worker</th><th className="text-right">Actions</th></tr></thead>
                                          <tbody>
                                            {c.bookings.sort((a, b) => (b.booking_date || '').localeCompare(a.booking_date || '')).map(b => {
                                              const freqName = getFrequencyName(b.frequency_id);
                                              const workerName = workers.find(w => w.id === b.worker_id)?.name || '';
                                              const isActionable = ['upcoming', 'scheduled'].includes(b.status);
                                              return (
                                                <tr key={b.id}>
                                                  <td><div className="cell-primary">{formatDate(b.booking_date)}</div><div className="cell-secondary">{b.booking_time}</div></td>
                                                  <td><div className="cell-primary">{b.building}</div><div className="cell-secondary">Unit {b.unit_number}</div></td>
                                                  <td className="cell-muted">{freqName || 'One-Time'}</td>
                                                  <td style={{ fontWeight: 600 }}>${b.total_price}</td>
                                                  <td><span className={`admin-pill ${b.status}`}>{b.status}</span></td>
                                                  <td className="cell-muted">{workerName || 'Unassigned'}</td>
                                                  <td>
                                                    <div className="admin-actions">
                                                      <button className="admin-btn-icon" title="Edit" onClick={(e) => { e.stopPropagation(); openSlide('booking', { ...b }); }}>
                                                        <Icons.edit style={{ width: 14, height: 14 }} />
                                                      </button>
                                                      {isActionable && (
                                                        <>
                                                          <button className="admin-btn-icon" title="Complete" onClick={(e) => { e.stopPropagation(); handleMarkComplete(b.id); }}><Icons.check style={{ width: 14, height: 14, color: 'var(--av-success)' }} /></button>
                                                          <button className="admin-btn-icon danger" title="Cancel" onClick={(e) => { e.stopPropagation(); handleCancelBooking(b.id); }}><Icons.x style={{ width: 14, height: 14 }} /></button>
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
                          <tr><td colSpan={6} className="admin-empty"><div className="admin-empty-text">{customerSearch ? 'No customers match your search.' : 'No customers found.'}</div></td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}


          {/* ═══ GENERIC CRUD TABS ═══ */}
          {/* --- Neighborhoods --- */}
          {activeTab === 'neighborhoods' && (
            <div>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Neighborhoods</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => handleAdd('neighborhoods')}><Icons.plus style={{ width: 14, height: 14 }} /> Add Neighborhood</button>
              </div>
              <div className="admin-filter-bar">
                <div className="admin-search-wrap"><Icons.search /><input className="admin-search-input" placeholder="Search..." value={searchNeighborhoods} onChange={(e) => setSearchNeighborhoods(e.target.value)} /></div>
                <label className="admin-filter-check"><input type="checkbox" checked={showArchivedNeighborhoods} onChange={(e) => setShowArchivedNeighborhoods(e.target.checked)} /> Show archived</label>
              </div>
              <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                <thead><tr><th>Name</th><th>Buildings</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {filteredNeighborhoods.map(n => (
                    <tr key={n.id} className={n.archived ? 'archived' : ''}>
                      <td className="cell-primary">{n.name}</td>
                      <td className="cell-muted">{buildings.filter(b => b.neighborhood_id === n.id).length} buildings</td>
                      <td><span className={`admin-pill ${n.archived ? 'archived-status' : 'active'}`}>{n.archived ? 'Archived' : 'Active'}</span></td>
                      <td><div className="admin-actions">
                        <button className="admin-btn-icon" title="Edit" onClick={() => openSlide('neighborhoods', n)}><Icons.edit style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon" title={n.archived ? 'Unarchive' : 'Archive'} onClick={() => handleToggleArchive('neighborhoods', n.id, n.archived)}><Icons.archive style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon danger" title="Delete" onClick={() => handleDelete('neighborhoods', n.id)}><Icons.trash style={{ width: 15, height: 15 }} /></button>
                      </div></td>
                    </tr>
                  ))}
                  {filteredNeighborhoods.length === 0 && <tr><td colSpan={4}><div className="admin-empty"><div className="admin-empty-text">No neighborhoods found.</div><button className="admin-btn admin-btn-primary" onClick={() => handleAdd('neighborhoods')}>Add first neighborhood</button></div></td></tr>}
                </tbody>
              </table></div></div>
            </div>
          )}

          {/* --- Buildings --- */}
          {activeTab === 'buildings' && (
            <div>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Buildings</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => handleAdd('buildings')}><Icons.plus style={{ width: 14, height: 14 }} /> Add Building</button>
              </div>
              <div className="admin-filter-bar">
                <div className="admin-search-wrap"><Icons.search /><input className="admin-search-input" placeholder="Search..." value={searchBuildings} onChange={(e) => setSearchBuildings(e.target.value)} /></div>
                <select className="admin-filter-select" value={selectedNeighborhood} onChange={(e) => setSelectedNeighborhood(e.target.value)}><option value="">All Neighborhoods</option>{neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}</select>
                <label className="admin-filter-check"><input type="checkbox" checked={showArchivedBuildings} onChange={(e) => setShowArchivedBuildings(e.target.checked)} /> Show archived</label>
              </div>
              <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                <thead><tr><th>Name</th><th>Address</th><th>Neighborhood</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {filteredBuildings.map(b => (
                    <tr key={b.id} className={b.archived ? 'archived' : ''}>
                      <td className="cell-primary">{b.name}</td>
                      <td className="cell-muted">{b.address}</td>
                      <td className="cell-muted">{neighborhoods.find(n => n.id === b.neighborhood_id)?.name}</td>
                      <td><span className={`admin-pill ${b.archived ? 'archived-status' : 'active'}`}>{b.archived ? 'Archived' : 'Active'}</span></td>
                      <td><div className="admin-actions">
                        <button className="admin-btn-icon" title="Edit" onClick={() => openSlide('buildings', b)}><Icons.edit style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon" title={b.archived ? 'Unarchive' : 'Archive'} onClick={() => handleToggleArchive('buildings', b.id, b.archived)}><Icons.archive style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon danger" title="Delete" onClick={() => handleDelete('buildings', b.id)}><Icons.trash style={{ width: 15, height: 15 }} /></button>
                      </div></td>
                    </tr>
                  ))}
                  {filteredBuildings.length === 0 && <tr><td colSpan={5}><div className="admin-empty"><div className="admin-empty-text">No buildings found.</div><button className="admin-btn admin-btn-primary" onClick={() => handleAdd('buildings')}>Add first building</button></div></td></tr>}
                </tbody>
              </table></div></div>
            </div>
          )}

          {/* --- Floor Plans --- */}
          {activeTab === 'floorplans' && (
            <div>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Floor Plans</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => handleAdd('floorplans')}><Icons.plus style={{ width: 14, height: 14 }} /> Add Floor Plan</button>
              </div>
              <div className="admin-filter-bar">
                <div className="admin-search-wrap"><Icons.search /><input className="admin-search-input" placeholder="Search..." value={searchFloorPlans} onChange={(e) => setSearchFloorPlans(e.target.value)} /></div>
                <select className="admin-filter-select" value={selectedBuilding} onChange={(e) => setSelectedBuilding(e.target.value)}><option value="">All Buildings</option>{buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                <label className="admin-filter-check"><input type="checkbox" checked={showArchivedFloorPlans} onChange={(e) => setShowArchivedFloorPlans(e.target.checked)} /> Show archived</label>
              </div>
              <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                <thead><tr><th>Name</th><th>Building</th><th>Price</th><th>Duration</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {filteredFloorPlans.map(f => (
                    <tr key={f.id} className={f.archived ? 'archived' : ''}>
                      <td className="cell-primary">{f.name}</td>
                      <td className="cell-muted">{buildings.find(b => b.id === f.building_id)?.name}</td>
                      <td style={{ fontWeight: 600 }}>${f.price}</td>
                      <td className="cell-muted">{f.duration_minutes || 60} min</td>
                      <td><span className={`admin-pill ${f.archived ? 'archived-status' : 'active'}`}>{f.archived ? 'Archived' : 'Active'}</span></td>
                      <td><div className="admin-actions">
                        <button className="admin-btn-icon" title="Edit" onClick={() => openSlide('floorplans', f)}><Icons.edit style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon" title={f.archived ? 'Unarchive' : 'Archive'} onClick={() => handleToggleArchive('floorplans', f.id, f.archived)}><Icons.archive style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon danger" title="Delete" onClick={() => handleDelete('floorplans', f.id)}><Icons.trash style={{ width: 15, height: 15 }} /></button>
                      </div></td>
                    </tr>
                  ))}
                  {filteredFloorPlans.length === 0 && <tr><td colSpan={6}><div className="admin-empty"><div className="admin-empty-text">No floor plans found.</div><button className="admin-btn admin-btn-primary" onClick={() => handleAdd('floorplans')}>Add first floor plan</button></div></td></tr>}
                </tbody>
              </table></div></div>
            </div>
          )}

          {/* --- Unit Lines --- */}
          {activeTab === 'unitlines' && (
            <div>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Unit Lines</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => handleAdd('unitlines')}><Icons.plus style={{ width: 14, height: 14 }} /> Add Unit Line</button>
              </div>
              <div className="admin-filter-bar">
                <div className="admin-search-wrap"><Icons.search /><input className="admin-search-input" placeholder="Search..." value={searchUnitLines} onChange={(e) => setSearchUnitLines(e.target.value)} /></div>
                <select className="admin-filter-select" value={selectedBuildingUL} onChange={(e) => setSelectedBuildingUL(e.target.value)}><option value="">All Buildings</option>{buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
                <label className="admin-filter-check"><input type="checkbox" checked={showArchivedUnitLines} onChange={(e) => setShowArchivedUnitLines(e.target.checked)} /> Show archived</label>
              </div>
              <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                <thead><tr><th>Building</th><th>Line</th><th>Floors</th><th>Floor Plan</th><th>Price</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {filteredUnitLines.map(ul => {
                    const fp = floorPlans.find(f => f.id === ul.floor_plan_id);
                    const displayPrice = ul.custom_price != null ? `$${ul.custom_price}` : (fp ? `$${fp.price}` : '—');
                    return (
                      <tr key={ul.id} className={ul.archived ? 'archived' : ''}>
                        <td className="cell-primary">{buildings.find(b => b.id === ul.building_id)?.name}</td>
                        <td className="cell-primary">{ul.line_number}</td>
                        <td className="cell-muted">{ul.floor_min} – {ul.floor_max}</td>
                        <td className="cell-muted">{fp?.name || '—'}</td>
                        <td><span style={{ fontWeight: 600 }}>{displayPrice}</span>{ul.custom_price != null && <span className="cell-secondary" style={{ marginLeft: 4 }}>(custom)</span>}</td>
                        <td><span className={`admin-pill ${ul.archived ? 'archived-status' : 'active'}`}>{ul.archived ? 'Archived' : 'Active'}</span></td>
                        <td><div className="admin-actions">
                          <button className="admin-btn-icon" title="Edit" onClick={() => openSlide('unitlines', { ...ul, custom_price: ul.custom_price ?? '' })}><Icons.edit style={{ width: 15, height: 15 }} /></button>
                          <button className="admin-btn-icon" title={ul.archived ? 'Unarchive' : 'Archive'} onClick={() => handleToggleArchive('unitlines', ul.id, ul.archived)}><Icons.archive style={{ width: 15, height: 15 }} /></button>
                          <button className="admin-btn-icon danger" title="Delete" onClick={() => handleDelete('unitlines', ul.id)}><Icons.trash style={{ width: 15, height: 15 }} /></button>
                        </div></td>
                      </tr>
                    );
                  })}
                  {filteredUnitLines.length === 0 && <tr><td colSpan={7}><div className="admin-empty"><div className="admin-empty-text">No unit lines found.</div><button className="admin-btn admin-btn-primary" onClick={() => handleAdd('unitlines')}>Add first unit line</button></div></td></tr>}
                </tbody>
              </table></div></div>
            </div>
          )}

          {/* --- Add-Ons --- */}
          {activeTab === 'addons' && (
            <div>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Add-Ons</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => handleAdd('addons')}><Icons.plus style={{ width: 14, height: 14 }} /> Add Add-On</button>
              </div>
              <div className="admin-filter-bar">
                <div className="admin-search-wrap"><Icons.search /><input className="admin-search-input" placeholder="Search..." value={searchAddOns} onChange={(e) => setSearchAddOns(e.target.value)} /></div>
                <label className="admin-filter-check"><input type="checkbox" checked={showArchivedAddOns} onChange={(e) => setShowArchivedAddOns(e.target.checked)} /> Show archived</label>
              </div>
              <div className="admin-banner">
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Add-Ons section on booking page</div>
                  <div className="cell-secondary">{addonsSectionVisible ? 'Customers can see and select add-ons when booking' : 'The entire add-ons section is hidden from the booking page'}</div>
                </div>
                <button className={`admin-btn admin-btn-sm ${addonsSectionVisible ? 'admin-btn-success' : 'admin-btn-danger'}`} onClick={handleToggleAddonsSection}>
                  {addonsSectionVisible ? 'Visible' : 'Hidden'}
                </button>
              </div>
              <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                <thead><tr><th>Name</th><th>Price</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {filteredAddOnsList.map(a => (
                    <tr key={a.id} className={a.archived ? 'archived' : ''}>
                      <td className="cell-primary">{a.name}</td>
                      <td style={{ fontWeight: 600 }}>${a.price}</td>
                      <td><span className={`admin-pill ${a.archived ? 'archived-status' : 'active'}`}>{a.archived ? 'Archived' : 'Active'}</span></td>
                      <td><div className="admin-actions">
                        <button className="admin-btn-icon" title="Edit" onClick={() => openSlide('addons', a)}><Icons.edit style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon" title={a.archived ? 'Unarchive' : 'Archive'} onClick={() => handleToggleArchive('addons', a.id, a.archived)}><Icons.archive style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon danger" title="Delete" onClick={() => handleDelete('addons', a.id)}><Icons.trash style={{ width: 15, height: 15 }} /></button>
                      </div></td>
                    </tr>
                  ))}
                  {filteredAddOnsList.length === 0 && <tr><td colSpan={4}><div className="admin-empty"><div className="admin-empty-text">No add-ons found.</div><button className="admin-btn admin-btn-primary" onClick={() => handleAdd('addons')}>Add first add-on</button></div></td></tr>}
                </tbody>
              </table></div></div>
            </div>
          )}

          {/* --- Workers --- */}
          {activeTab === 'workers' && (
            <div>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Workers</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => handleAdd('workers')}><Icons.plus style={{ width: 14, height: 14 }} /> Add Worker</button>
              </div>
              <div className="admin-filter-bar">
                <div className="admin-search-wrap"><Icons.search /><input className="admin-search-input" placeholder="Search..." value={searchWorkers} onChange={(e) => setSearchWorkers(e.target.value)} /></div>
                <label className="admin-filter-check"><input type="checkbox" checked={showArchivedWorkers} onChange={(e) => setShowArchivedWorkers(e.target.checked)} /> Show archived</label>
              </div>
              <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Assigned</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {filteredWorkers.map(w => (
                    <tr key={w.id} className={w.archived ? 'archived' : ''}>
                      <td className="cell-primary">{w.name}</td>
                      <td className="cell-muted">{w.email}</td>
                      <td className="cell-muted">{w.phone}</td>
                      <td className="cell-muted">{bookings.filter(b => b.worker_id === w.id && b.status === 'upcoming').length} upcoming</td>
                      <td><span className={`admin-pill ${w.archived ? 'archived-status' : 'active'}`}>{w.archived ? 'Archived' : 'Active'}</span></td>
                      <td><div className="admin-actions">
                        <button className="admin-btn-icon" title="Edit" onClick={() => openSlide('workers', w)}><Icons.edit style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon" title={w.archived ? 'Unarchive' : 'Archive'} onClick={() => handleToggleArchive('workers', w.id, w.archived)}><Icons.archive style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon danger" title="Delete" onClick={() => handleDelete('workers', w.id)}><Icons.trash style={{ width: 15, height: 15 }} /></button>
                      </div></td>
                    </tr>
                  ))}
                  {filteredWorkers.length === 0 && <tr><td colSpan={6}><div className="admin-empty"><div className="admin-empty-text">No workers found.</div><button className="admin-btn admin-btn-primary" onClick={() => handleAdd('workers')}>Add first worker</button></div></td></tr>}
                </tbody>
              </table></div></div>
            </div>
          )}

          {/* --- Frequencies --- */}
          {activeTab === 'frequencies' && (
            <div>
              <div className="admin-page-header">
                <h1 className="admin-page-title">Frequencies</h1>
                <button className="admin-btn admin-btn-primary" onClick={() => handleAdd('frequencies')}><Icons.plus style={{ width: 14, height: 14 }} /> Add Frequency</button>
              </div>
              <div className="admin-filter-bar">
                <div className="admin-search-wrap"><Icons.search /><input className="admin-search-input" placeholder="Search..." value={searchFrequencies} onChange={(e) => setSearchFrequencies(e.target.value)} /></div>
                <label className="admin-filter-check"><input type="checkbox" checked={showArchivedFrequencies} onChange={(e) => setShowArchivedFrequencies(e.target.checked)} /> Show archived</label>
              </div>
              <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                <thead><tr><th>Name</th><th>Discount</th><th>Interval</th><th>Sort</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
                <tbody>
                  {filteredFrequenciesList.map(f => (
                    <tr key={f.id} className={f.archived ? 'archived' : ''}>
                      <td className="cell-primary">{f.name}</td>
                      <td style={{ fontWeight: 600 }}>{f.discount_percent}%</td>
                      <td className="cell-muted">{f.interval_days} days</td>
                      <td className="cell-muted">{f.sort_order}</td>
                      <td><span className={`admin-pill ${f.archived ? 'archived-status' : 'active'}`}>{f.archived ? 'Archived' : 'Active'}</span></td>
                      <td><div className="admin-actions">
                        <button className="admin-btn-icon" title="Edit" onClick={() => openSlide('frequencies', f)}><Icons.edit style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon" title={f.archived ? 'Unarchive' : 'Archive'} onClick={() => handleToggleArchive('frequencies', f.id, f.archived)}><Icons.archive style={{ width: 15, height: 15 }} /></button>
                        <button className="admin-btn-icon danger" title="Delete" onClick={() => handleDelete('frequencies', f.id)}><Icons.trash style={{ width: 15, height: 15 }} /></button>
                      </div></td>
                    </tr>
                  ))}
                  {filteredFrequenciesList.length === 0 && <tr><td colSpan={6}><div className="admin-empty"><div className="admin-empty-text">No frequencies found.</div><button className="admin-btn admin-btn-primary" onClick={() => handleAdd('frequencies')}>Add first frequency</button></div></td></tr>}
                </tbody>
              </table></div></div>
            </div>
          )}


          {/* ═══ AVAILABILITY TAB ═══ */}
          {activeTab === 'availability' && (
            <div>
              <h1 className="admin-page-title" style={{ marginBottom: 20 }}>Availability</h1>

              <div className="admin-subtabs">
                {[
                  { id: 'weekly', label: 'Weekly Schedules' },
                  { id: 'blocked', label: 'Blocked Dates' },
                  { id: 'overrides', label: 'Schedule Overrides' },
                ].map(tab => (
                  <button key={tab.id} className={`admin-subtab ${availabilitySubTab === tab.id ? 'active' : ''}`} onClick={() => setAvailabilitySubTab(tab.id)}>
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Weekly Schedules */}
              {availabilitySubTab === 'weekly' && (
                <div>
                  {!selectedWorkerAvail ? (
                    <div>
                      <p className="admin-page-subtitle" style={{ marginBottom: 16 }}>Click on a worker to view and edit their weekly schedule.</p>
                      <div className="admin-schedule-cards">
                        {workers.map(w => {
                          const workerAvail = getWorkerAvailability(w.id);
                          const activeDays = workerAvail.filter(d => d.is_active && !d.isNew).length;
                          const hasSchedule = workerAvail.some(d => !d.isNew);
                          return (
                            <div key={w.id} className="admin-schedule-card" onClick={() => { setSelectedWorkerAvail(w.id); setEditingAvailability(getWorkerAvailability(w.id)); }}>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{w.name}</p>
                                <p className="cell-secondary">{hasSchedule ? `${activeDays} day${activeDays !== 1 ? 's' : ''} active` : 'No schedule set'}</p>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div className="admin-day-chips">
                                  {DAY_NAMES.map((d, idx) => {
                                    const day = workerAvail[idx];
                                    const cls = (day.is_active && !day.isNew) ? 'active-day' : day.isNew ? 'unset-day' : 'off-day';
                                    return <div key={idx} className={`admin-day-chip ${cls}`}>{d.slice(0, 2)}</div>;
                                  })}
                                </div>
                                <Icons.chevronRight style={{ width: 16, height: 16, color: 'var(--av-text-muted)' }} />
                              </div>
                            </div>
                          );
                        })}
                        {workers.length === 0 && (
                          <div className="admin-card" style={{ textAlign: 'center', padding: 32 }}>
                            <p className="cell-muted">No workers found. Add workers first in the Workers tab.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { setSelectedWorkerAvail(''); setEditingAvailability(null); }}>
                          <Icons.arrowLeft style={{ width: 14, height: 14 }} /> Back
                        </button>
                        <h2 style={{ fontSize: 16, fontWeight: 600 }}>{workers.find(w => w.id === selectedWorkerAvail)?.name} — Weekly Schedule</h2>
                      </div>
                      <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                        <thead><tr><th>Day</th><th style={{ textAlign: 'center' }}>Day Off</th><th>Start</th><th>End</th></tr></thead>
                        <tbody>
                          {(editingAvailability || getWorkerAvailability(selectedWorkerAvail)).map((day, idx) => (
                            <tr key={idx} className={!day.is_active ? 'archived' : ''}>
                              <td className="cell-primary">{DAY_NAMES[idx]}</td>
                              <td style={{ textAlign: 'center' }}>
                                <input type="checkbox" checked={!day.is_active} onChange={(e) => {
                                  const updated = [...(editingAvailability || getWorkerAvailability(selectedWorkerAvail))];
                                  updated[idx] = { ...updated[idx], is_active: !e.target.checked };
                                  setEditingAvailability(updated);
                                }} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--av-navy)' }} />
                              </td>
                              <td>
                                <select className="admin-select" style={{ width: 140 }} value={day.start_time?.slice(0, 5) || '09:00'} disabled={!day.is_active}
                                  onChange={(e) => { const u = [...(editingAvailability || getWorkerAvailability(selectedWorkerAvail))]; u[idx] = { ...u[idx], start_time: e.target.value }; setEditingAvailability(u); }}>
                                  {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                </select>
                              </td>
                              <td>
                                <select className="admin-select" style={{ width: 140 }} value={day.end_time?.slice(0, 5) || '16:00'} disabled={!day.is_active}
                                  onChange={(e) => { const u = [...(editingAvailability || getWorkerAvailability(selectedWorkerAvail))]; u[idx] = { ...u[idx], end_time: e.target.value }; setEditingAvailability(u); }}>
                                  {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table></div></div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <button className="admin-btn admin-btn-primary" onClick={() => handleSaveWeeklySchedule(selectedWorkerAvail)} disabled={availSaving}>
                          {availSaving ? 'Saving...' : 'Save Schedule'}
                        </button>
                        <button className="admin-btn admin-btn-secondary" onClick={() => { setSelectedWorkerAvail(''); setEditingAvailability(null); }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Blocked Dates */}
              {availabilitySubTab === 'blocked' && (
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 400px', minWidth: 320 }}>
                    <div style={{ marginBottom: 16 }}>
                      <select className="admin-select" style={{ width: 240 }} value={blockedDateForm.worker_id} onChange={(e) => setBlockedDateForm({ ...blockedDateForm, worker_id: e.target.value })}>
                        <option value="">Select worker...</option>
                        {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="admin-calendar" style={{ marginBottom: 16 }}>
                      <div className="admin-cal-nav">
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { if (calendarMonth === 0) { setCalendarMonth(11); setCalendarYear(calendarYear - 1); } else setCalendarMonth(calendarMonth - 1); }}>&lt;</button>
                        <span className="admin-cal-title">{MONTH_NAMES[calendarMonth]} {calendarYear}</span>
                        <button className="admin-btn admin-btn-secondary admin-btn-sm" onClick={() => { if (calendarMonth === 11) { setCalendarMonth(0); setCalendarYear(calendarYear + 1); } else setCalendarMonth(calendarMonth + 1); }}>&gt;</button>
                      </div>
                      <div className="admin-cal-grid">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => <div key={d} className="admin-cal-head">{d}</div>)}
                        {getCalendarDays(calendarYear, calendarMonth).map((day, i) => {
                          const dateStr = formatDateISO(day.date);
                          const workerBlocked = blockedDates.filter(bd => bd.blocked_date === dateStr && (!blockedDateForm.worker_id || bd.worker_id === blockedDateForm.worker_id));
                          const isBlocked = workerBlocked.length > 0;
                          const isSelected = blockedDateForm.blocked_date === dateStr;
                          const isToday = formatDateISO(new Date()) === dateStr;
                          let cls = 'admin-cal-day';
                          if (!day.isCurrentMonth) cls += ' other-month';
                          if (isSelected) cls += ' selected';
                          else if (isBlocked) cls += ' blocked';
                          else if (isToday) cls += ' today';
                          return (
                            <button key={i} className={cls} onClick={() => { if (blockedDateForm.worker_id) setBlockedDateForm({ ...blockedDateForm, blocked_date: dateStr }); }}>
                              {day.date.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {blockedDateForm.worker_id && blockedDateForm.blocked_date && (
                      <div className="admin-card">
                        <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>
                          Block {formatDate(blockedDateForm.blocked_date)} for {workers.find(w => w.id === blockedDateForm.worker_id)?.name}
                        </p>
                        <label className="admin-filter-check" style={{ marginBottom: 12 }}>
                          <input type="checkbox" checked={blockedDateForm.all_day} onChange={(e) => setBlockedDateForm({ ...blockedDateForm, all_day: e.target.checked })} />
                          All Day
                        </label>
                        {!blockedDateForm.all_day && (
                          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                            <div className="admin-form-group"><label className="admin-label">Start</label><input className="admin-input" type="time" value={blockedDateForm.start_time} onChange={(e) => setBlockedDateForm({ ...blockedDateForm, start_time: e.target.value })} /></div>
                            <div className="admin-form-group"><label className="admin-label">End</label><input className="admin-input" type="time" value={blockedDateForm.end_time} onChange={(e) => setBlockedDateForm({ ...blockedDateForm, end_time: e.target.value })} /></div>
                          </div>
                        )}
                        <div className="admin-form-group" style={{ marginBottom: 12 }}>
                          <label className="admin-label">Reason (optional)</label>
                          <input className="admin-input" value={blockedDateForm.reason} onChange={(e) => setBlockedDateForm({ ...blockedDateForm, reason: e.target.value })} placeholder="e.g. Vacation" />
                        </div>
                        <button className="admin-btn admin-btn-danger" onClick={handleAddBlockedDate}>Block This Date</button>
                      </div>
                    )}
                  </div>
                  <div style={{ flex: '1 1 380px', minWidth: 300 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Upcoming Blocked Dates</p>
                    <div className="admin-table-wrap">
                      {blockedDates
                        .filter(bd => !blockedDateForm.worker_id || bd.worker_id === blockedDateForm.worker_id)
                        .filter(bd => bd.blocked_date >= formatDateISO(new Date()))
                        .sort((a, b) => a.blocked_date.localeCompare(b.blocked_date))
                        .map(bd => (
                          <div key={bd.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--av-border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div className="cell-primary">{formatDate(bd.blocked_date)} <span className="cell-secondary">{workers.find(w => w.id === bd.worker_id)?.name}</span></div>
                              <div className="cell-secondary">{bd.all_day ? 'All day' : `${bd.start_time?.slice(0, 5)} - ${bd.end_time?.slice(0, 5)}`}{bd.reason && ` · ${bd.reason}`}</div>
                            </div>
                            <button className="admin-btn-icon danger" title="Delete" onClick={() => handleDeleteBlockedDate(bd.id)}><Icons.trash style={{ width: 14, height: 14 }} /></button>
                          </div>
                        ))}
                      {blockedDates.filter(bd => !blockedDateForm.worker_id || bd.worker_id === blockedDateForm.worker_id).filter(bd => bd.blocked_date >= formatDateISO(new Date())).length === 0 && (
                        <div style={{ padding: 24, textAlign: 'center', color: 'var(--av-text-muted)', fontSize: 13 }}>No upcoming blocked dates.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Schedule Overrides */}
              {availabilitySubTab === 'overrides' && (
                <div>
                  <div className="admin-card" style={{ marginBottom: 24 }}>
                    <p className="admin-card-title" style={{ marginBottom: 16 }}>Add Schedule Override</p>
                    <div className="admin-form-grid">
                      <div className="admin-form-group"><label className="admin-label">Worker</label><select className="admin-select" value={overrideForm.worker_id} onChange={(e) => setOverrideForm({ ...overrideForm, worker_id: e.target.value })}><option value="">Select worker...</option>{workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}</select></div>
                      <div className="admin-form-group"><label className="admin-label">Date</label><input className="admin-input" type="date" value={overrideForm.override_date} onChange={(e) => setOverrideForm({ ...overrideForm, override_date: e.target.value })} /></div>
                      <div className="admin-form-group"><label className="admin-label">Start Time</label><input className="admin-input" type="time" value={overrideForm.start_time} onChange={(e) => setOverrideForm({ ...overrideForm, start_time: e.target.value })} /></div>
                      <div className="admin-form-group"><label className="admin-label">End Time</label><input className="admin-input" type="time" value={overrideForm.end_time} onChange={(e) => setOverrideForm({ ...overrideForm, end_time: e.target.value })} /></div>
                      <div className="admin-form-group"><label className="admin-label">Status</label><select className="admin-select" value={overrideForm.is_available ? 'available' : 'unavailable'} onChange={(e) => setOverrideForm({ ...overrideForm, is_available: e.target.value === 'available' })}><option value="available">Available</option><option value="unavailable">Unavailable</option></select></div>
                      <div className="admin-form-group"><label className="admin-label">Reason</label><input className="admin-input" value={overrideForm.reason} onChange={(e) => setOverrideForm({ ...overrideForm, reason: e.target.value })} placeholder="e.g. Working Saturday" /></div>
                    </div>
                    <button className="admin-btn admin-btn-primary" style={{ marginTop: 16 }} onClick={handleAddOverride}><Icons.plus style={{ width: 14, height: 14 }} /> Add Override</button>
                  </div>
                  <div className="admin-table-wrap"><div className="admin-table-scroll"><table className="admin-table">
                    <thead><tr><th>Worker</th><th>Date</th><th>Hours</th><th>Status</th><th>Reason</th><th className="text-right">Actions</th></tr></thead>
                    <tbody>
                      {scheduleOverrides.sort((a, b) => a.override_date.localeCompare(b.override_date)).map(so => (
                        <tr key={so.id}>
                          <td className="cell-primary">{workers.find(w => w.id === so.worker_id)?.name || 'Unknown'}</td>
                          <td>{formatDate(so.override_date)}</td>
                          <td className="cell-muted">{so.start_time?.slice(0, 5)} – {so.end_time?.slice(0, 5)}</td>
                          <td><span className={`admin-pill ${so.is_available ? 'available' : 'unavailable'}`}>{so.is_available ? 'Available' : 'Unavailable'}</span></td>
                          <td className="cell-muted">{so.reason || '—'}</td>
                          <td><div className="admin-actions"><button className="admin-btn-icon danger" title="Delete" onClick={() => handleDeleteOverride(so.id)}><Icons.trash style={{ width: 15, height: 15 }} /></button></div></td>
                        </tr>
                      ))}
                      {scheduleOverrides.length === 0 && <tr><td colSpan={6}><div className="admin-empty"><div className="admin-empty-text">No schedule overrides.</div></div></td></tr>}
                    </tbody>
                  </table></div></div>
                </div>
              )}
            </div>
          )}


          {/* ═══ SETTINGS TAB ═══ */}
          {activeTab === 'settings' && (
            <div>
              <h1 className="admin-page-title" style={{ marginBottom: 24 }}>Settings</h1>
              <div className="admin-card" style={{ maxWidth: 600 }}>
                <p className="admin-card-title" style={{ marginBottom: 16 }}>Scheduling Configuration</p>
                {[
                  { key: 'slot_duration_minutes', label: 'Slot Duration', description: 'Length of each booking time slot', options: SLOT_DURATION_OPTIONS },
                  { key: 'buffer_between_jobs_minutes', label: 'Buffer Between Jobs', description: 'Break time between consecutive bookings', options: BUFFER_OPTIONS },
                  { key: 'minimum_notice_hours', label: 'Minimum Notice', description: 'Minimum hours before a booking can be made', options: NOTICE_OPTIONS },
                  { key: 'advance_booking_days', label: 'How Far in Advance', description: 'How far in advance customers can book', options: ADVANCE_OPTIONS },
                ].map(setting => (
                  <div key={setting.key} className="admin-setting-row">
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div className="admin-setting-label">{setting.label}</div>
                      <div className="admin-setting-desc">{setting.description}</div>
                    </div>
                    <select
                      className="admin-select" style={{ width: 180 }}
                      value={editingSettings ? (editingSettings[setting.key] || '') : (serviceSettings[setting.key] || '')}
                      onChange={(e) => {
                        if (!editingSettings) setEditingSettings({ ...serviceSettings, [setting.key]: e.target.value });
                        else setEditingSettings({ ...editingSettings, [setting.key]: e.target.value });
                      }}
                    >
                      {setting.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                ))}
                <div style={{ marginTop: 20, display: 'flex', gap: 8 }}>
                  <button className="admin-btn admin-btn-primary" onClick={handleSaveServiceSettings} disabled={availSaving || !editingSettings}>
                    {availSaving ? 'Saving...' : 'Save Settings'}
                  </button>
                  {editingSettings && (
                    <button className="admin-btn admin-btn-secondary" onClick={() => setEditingSettings(null)}>Cancel</button>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── Slide Panel ── */}
      <SlidePanel
        open={slideOpen}
        onClose={() => setSlideOpen(false)}
        title={slideTitle}
        footer={
          <>
            <button className="admin-btn admin-btn-secondary" onClick={() => setSlideOpen(false)}>Cancel</button>
            <button className="admin-btn admin-btn-primary" onClick={handleSlideSave} disabled={slideSaving}>
              {slideSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {renderSlideForm()}
      </SlidePanel>
    </div>
  );
}
