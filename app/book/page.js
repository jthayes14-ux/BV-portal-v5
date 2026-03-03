'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

function formatHour(hour) {
  const h = hour % 12 || 12;
  const ampm = hour < 12 ? 'AM' : 'PM';
  return `${h}:00 ${ampm}`;
}

function BookingFlowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [neighborhoods, setNeighborhoods] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
  const [addonsSectionVisible, setAddonsSectionVisible] = useState(true);
  const [frequencies, setFrequencies] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [neighborhood, setNeighborhood] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [floorPlanId, setFloorPlanId] = useState('');
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [frequencyId, setFrequencyId] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [focusedField, setFocusedField] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Unit line lookup state
  const [unitLookupResult, setUnitLookupResult] = useState(null); // { found: true, unitLine, floorPlan } or { found: false }
  const [unitLookupLoading, setUnitLookupLoading] = useState(false);
  const [showFloorPlanFallback, setShowFloorPlanFallback] = useState(false);

  // Dynamic availability state
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

  // Contact info fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Rebook state
  const [isRebook, setIsRebook] = useState(false);
  const [rebookBuildingName, setRebookBuildingName] = useState('');

  const brand = {
    primary: '#B8C5F2', primaryDark: '#9AA8E0', primaryLight: '#E8EDFC',
    gold: '#C9B037', goldLight: '#F5F0DC', goldDark: '#A69028',
    text: '#1F2937', textLight: '#6B7280', textMuted: '#9CA3AF',
    border: '#E5E7EB', borderLight: '#F3F4F6', bg: '#FAFBFF', bgCard: '#FFFFFF',
  };

  // Track whether rebook data was used so we don't overwrite it with profile data
  const [usedRebook, setUsedRebook] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Auto-fill from user profile and most recent booking when user is available
  useEffect(() => {
    if (!user || profileLoaded || usedRebook) return;
    loadUserProfile();
  }, [user, profileLoaded, usedRebook]);

  // Compute available time slots when date changes
  useEffect(() => {
    if (!date) {
      setAvailableSlots([]);
      setSlotsMessage('');
      setAssignedWorkerId(null);
      return;
    }
    computeAvailableSlots(date);
  }, [date, allAvailability, allBlockedDates, allOverrides, allWorkers, serviceSettings]);

  const computeAvailableSlots = async (selectedDate) => {
    setSlotsLoading(true);
    setSlotsMessage('');
    setAvailableSlots([]);
    setTime('');
    setAssignedWorkerId(null);

    const slotDuration = Number(serviceSettings.slot_duration_minutes) || 60;
    const buffer = Number(serviceSettings.buffer_between_jobs_minutes) || 15;
    const minNoticeHours = Number(serviceSettings.minimum_notice_hours) || 24;
    const advanceDays = Number(serviceSettings.advance_booking_days) || 30;

    const dateObj = new Date(selectedDate + 'T00:00:00');
    const now = new Date();

    // Check minimum notice
    const minNoticeTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);
    const endOfSelectedDay = new Date(selectedDate + 'T23:59:59');
    if (endOfSelectedDay < minNoticeTime) {
      setSlotsMessage('This date is too soon — minimum notice required.');
      setSlotsLoading(false);
      return;
    }

    // Check max advance booking
    const maxAdvanceDate = new Date();
    maxAdvanceDate.setDate(maxAdvanceDate.getDate() + advanceDays);
    if (dateObj > maxAdvanceDate) {
      setSlotsMessage('This date is too far in advance.');
      setSlotsLoading(false);
      return;
    }

    // day_of_week: 0=Monday, 6=Sunday in our DB. JS getDay: 0=Sun, 1=Mon, ..., 6=Sat
    const jsDay = dateObj.getDay();
    const dbDayOfWeek = jsDay === 0 ? 6 : jsDay - 1;

    // If workers exist, use their schedules. Otherwise fall back to default 9-4 business hours.
    const useWorkerSchedules = allWorkers.length > 0;

    if (useWorkerSchedules) {
      // --- Worker-based slot calculation ---
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('booking_time, worker_id')
        .eq('booking_date', selectedDate)
        .in('status', ['upcoming', 'scheduled']);
      const bookedSlots = existingBookings || [];

      const slotMap = {}; // { "9:00 AM": [workerId1, ...] }

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
            // No schedule set for this day — use default 9-4 business hours
            isAvailable = true;
            startTime = '09:00';
            endTime = '16:00';
          }
        }

        if (!isAvailable) continue;

        // Check blocked dates
        const blocked = allBlockedDates.filter(bd => bd.worker_id === worker.id && bd.blocked_date === selectedDate);
        if (blocked.some(bd => bd.all_day)) continue;

        const startHour = parseInt(startTime?.slice(0, 2) || '9', 10);
        const startMin = parseInt(startTime?.slice(3, 5) || '0', 10);
        const endHour = parseInt(endTime?.slice(0, 2) || '16', 10);
        const endMin = parseInt(endTime?.slice(3, 5) || '0', 10);
        const startMinutes = startHour * 60 + startMin;
        const endMinutes = endHour * 60 + endMin;

        // Worker's existing bookings
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

        // Partial blocked date ranges
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
      // --- Default business hours (no worker schedules configured) ---
      const businessStart = 9 * 60;  // 9:00 AM
      const businessEnd = 16 * 60;   // 4:00 PM
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

  const loadData = async () => {
    const [nRes, aoRes, freqRes, svcRes, avRes, bdRes, soRes, wRes] = await Promise.all([
      supabase.from('neighborhoods').select('*').eq('archived', false).order('name'),
      supabase.from('add_ons').select('*').eq('archived', false).order('name'),
      supabase.from('frequencies').select('*').eq('archived', false).order('sort_order'),
      supabase.from('site_settings').select('*'),
      supabase.from('availability').select('*').order('day_of_week'),
      supabase.from('blocked_dates').select('*').order('blocked_date'),
      supabase.from('schedule_overrides').select('*').order('override_date'),
      supabase.from('workers').select('*').eq('archived', false).order('name'),
    ]);
    const neighborhoodsData = nRes.data || [];
    setNeighborhoods(neighborhoodsData);
    const allSettings = svcRes.data || [];
    const addonSetting = allSettings.find(s => s.key === 'addons_section_visible');
    const sectionVisible = addonSetting ? addonSetting.value === 'true' : true;
    setAddonsSectionVisible(sectionVisible);
    setAddOns(sectionVisible ? (aoRes.data || []) : []);
    const freqData = freqRes.data || [];
    setFrequencies(freqData);
    // Default to the first frequency (One-Time) if available
    const oneTime = freqData.find(f => f.interval_days === 0);
    if (oneTime) setFrequencyId(oneTime.id);

    // Load availability-related data
    const settingsObj = {};
    allSettings.forEach(s => { settingsObj[s.key] = s.value; });
    setServiceSettings(settingsObj);
    setAllAvailability(avRes.data || []);
    setAllBlockedDates(bdRes.data || []);
    setAllOverrides(soRes.data || []);
    setAllWorkers(wRes.data || []);

    // Calculate max booking date
    const advanceDays = Number(settingsObj.advance_booking_days) || 30;
    const maxD = new Date();
    maxD.setDate(maxD.getDate() + advanceDays);
    setMaxDate(maxD.toISOString().split('T')[0]);

    // Check for rebook info
    const isRebookParam = searchParams.get('rebook') === 'true';
    const storedRebook = localStorage.getItem('rebookInfo');
    if (isRebookParam && storedRebook) {
      try {
        const rebook = JSON.parse(storedRebook);
        setIsRebook(true);
        setUsedRebook(true);
        setRebookBuildingName(rebook.building_name || '');

        // Pre-fill contact info
        if (rebook.guest_first_name) setFirstName(rebook.guest_first_name);
        if (rebook.guest_last_name) setLastName(rebook.guest_last_name);
        if (rebook.guest_email) setEmail(rebook.guest_email);
        if (rebook.guest_phone) setPhone(rebook.guest_phone);

        // Pre-fill property info — need to find neighborhood from building
        if (rebook.building_id) {
          // Look up the building to get its neighborhood_id
          const { data: buildingData } = await supabase
            .from('buildings')
            .select('*')
            .eq('id', rebook.building_id)
            .single();

          if (buildingData && buildingData.neighborhood_id) {
            setNeighborhood(buildingData.neighborhood_id);

            // Load buildings for this neighborhood
            const { data: bldgs } = await supabase
              .from('buildings')
              .select('*')
              .eq('neighborhood_id', buildingData.neighborhood_id)
              .eq('archived', false)
              .order('name');
            setBuildings(bldgs || []);
            setBuildingId(rebook.building_id);

          }
        }

        if (rebook.unit_number) {
          setUnit(rebook.unit_number);
          // Trigger unit line lookup if building is set
          if (rebook.building_id) {
            await lookupUnitLine(rebook.building_id, rebook.unit_number);
          }
        } else if (rebook.floor_plan_id) {
          // No unit but has floor plan — load floor plans and set as fallback
          if (rebook.building_id) {
            await loadFloorPlans(rebook.building_id);
            setFloorPlanId(rebook.floor_plan_id);
            setShowFloorPlanFallback(true);
          }
        }

        // Clean up — keep it in localStorage for future "Book Again" but remove the rebook query param behavior
        localStorage.removeItem('rebookInfo');
      } catch (e) {
        // Invalid rebook data, ignore
      }
    }

    setDataLoading(false);
  };

  const loadUserProfile = async () => {
    setProfileLoaded(true);

    // Fetch user profile for contact info
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Auto-fill contact info from profile
    if (profile) {
      if (profile.first_name && !firstName) setFirstName(profile.first_name);
      if (profile.last_name && !lastName) setLastName(profile.last_name);
      if (profile.phone && !phone) setPhone(profile.phone);
    }

    // Fill email from auth user if not already set
    if (user.email && !email) setEmail(user.email);

    // Also fill name from auth metadata if profile didn't have it
    if (!firstName && !profile?.first_name && user.user_metadata?.full_name) {
      const parts = user.user_metadata.full_name.split(' ');
      setFirstName(parts[0] || '');
      if (!lastName && !profile?.last_name) setLastName(parts.slice(1).join(' ') || '');
    }

    // Fetch most recent booking for property info auto-fill
    const { data: lastBooking } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastBooking && !neighborhood && !buildingId) {
      // Look up the building to get neighborhood_id
      if (lastBooking.building_id) {
        const { data: buildingData } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', lastBooking.building_id)
          .single();

        if (buildingData && buildingData.neighborhood_id) {
          setNeighborhood(buildingData.neighborhood_id);

          const { data: bldgs } = await supabase
            .from('buildings')
            .select('*')
            .eq('neighborhood_id', buildingData.neighborhood_id)
            .eq('archived', false)
            .order('name');
          setBuildings(bldgs || []);
          setBuildingId(lastBooking.building_id);

        }
      }

      if (lastBooking.unit_number && !unit) {
        setUnit(lastBooking.unit_number);
        // Trigger unit line lookup if building is set
        if (lastBooking.building_id) {
          await lookupUnitLine(lastBooking.building_id, lastBooking.unit_number);
        }
      } else if (lastBooking.floor_plan_id && lastBooking.building_id) {
        // No unit but has floor plan — load floor plans and set as fallback
        await loadFloorPlans(lastBooking.building_id);
        setFloorPlanId(lastBooking.floor_plan_id);
        setShowFloorPlanFallback(true);
      }
    }
  };

  const loadBuildings = async (neighborhoodId) => {
    const { data } = await supabase.from('buildings').select('*').eq('neighborhood_id', neighborhoodId).eq('archived', false).order('name');
    setBuildings(data || []);
  };

  const loadFloorPlans = async (bId) => {
    const { data } = await supabase.from('floor_plans').select('*').eq('building_id', bId).eq('archived', false).order('price');
    setFloorPlans(data || []);
  };

  // Parse unit number into floor and line components
  const parseUnitNumber = (unitStr) => {
    const trimmed = (unitStr || '').trim();
    if (!trimmed) return null;

    // Check if unit ends in letter(s): e.g. "57D", "12M", "3AB"
    const letterMatch = trimmed.match(/^(\d+)([A-Za-z]+)$/);
    if (letterMatch) {
      return { floor: parseInt(letterMatch[1], 10), line: letterMatch[2].toUpperCase() };
    }

    // All numbers: e.g. "2207" -> floor = 22, line = "07"
    const numberMatch = trimmed.match(/^(\d+)$/);
    if (numberMatch && trimmed.length >= 3) {
      const digits = numberMatch[1];
      const line = digits.slice(-2);
      const floor = parseInt(digits.slice(0, -2), 10);
      return { floor, line };
    }

    return null;
  };

  // Look up unit line from the database
  const lookupUnitLine = async (bId, unitStr) => {
    setUnitLookupLoading(true);
    setUnitLookupResult(null);
    setShowFloorPlanFallback(false);
    setFloorPlanId('');

    const parsed = parseUnitNumber(unitStr);
    if (!parsed) {
      setUnitLookupResult({ found: false });
      setShowFloorPlanFallback(true);
      setUnitLookupLoading(false);
      // Load floor plans for fallback dropdown
      await loadFloorPlans(bId);
      return;
    }

    const { floor, line } = parsed;

    // Query unit_lines: building_id matches, line_number matches (case insensitive), floor in range
    const { data: unitLines } = await supabase
      .from('unit_lines')
      .select('*, floor_plan:floor_plan_id(*)')
      .eq('building_id', bId)
      .eq('archived', false)
      .ilike('line_number', line);

    // Filter for floor range match
    const match = (unitLines || []).find(ul =>
      floor >= ul.floor_min && floor <= ul.floor_max
    );

    if (match && match.floor_plan) {
      const price = match.custom_price != null ? Number(match.custom_price) : Number(match.floor_plan.price);
      setUnitLookupResult({
        found: true,
        unitLine: match,
        floorPlan: match.floor_plan,
        displayPrice: price,
      });
      setFloorPlanId(match.floor_plan.id);
      setShowFloorPlanFallback(false);
    } else {
      setUnitLookupResult({ found: false });
      setShowFloorPlanFallback(true);
      // Load floor plans for fallback dropdown
      await loadFloorPlans(bId);
    }

    setUnitLookupLoading(false);
  };

  const selectedPlan = floorPlans.find(p => String(p.id) === String(floorPlanId));
  const selectedBuilding = buildings.find(b => String(b.id) === String(buildingId));
  const selectedNeighborhood = neighborhoods.find(n => String(n.id) === String(neighborhood));
  const selectedFrequency = frequencies.find(f => String(f.id) === String(frequencyId));

  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const addon = addOns.find(a => a.id === id);
    return sum + (Number(addon?.price) || 0);
  }, 0);

  // Use custom_price from unit line lookup if available, otherwise floor plan price
  const basePrice = unitLookupResult?.found && unitLookupResult.displayPrice != null
    ? unitLookupResult.displayPrice
    : (Number(selectedPlan?.price) || 0);
  const subtotal = basePrice + addOnsTotal;
  const frequencyDiscount = selectedFrequency && Number(selectedFrequency.discount_percent) > 0
    ? Math.round(subtotal * Number(selectedFrequency.discount_percent) / 100 * 100) / 100
    : 0;
  const total = Math.max(0, subtotal - frequencyDiscount);

  const unitReady = unit && floorPlanId && (unitLookupResult?.found || showFloorPlanFallback);
  const serviceSelected = neighborhood && buildingId && unitReady && date && time;
  const contactValid = firstName.trim() && lastName.trim() && email.trim() && phone.trim();
  const canBook = serviceSelected && contactValid;
  const today = new Date().toISOString().split('T')[0];

  const handleContinue = () => {
    if (!canBook) return;
    const bookingData = {
      neighborhood_id: neighborhood,
      neighborhood_name: selectedNeighborhood?.name || '',
      building_id: buildingId,
      building_name: selectedBuilding?.name || '',
      building_address: selectedBuilding?.address || '',
      floor_plan_id: floorPlanId,
      floor_plan_name: unitLookupResult?.found ? unitLookupResult.floorPlan.name : (selectedPlan?.name || ''),
      unit, date, time_slot: time,
      frequency_id: frequencyId,
      frequency_name: selectedFrequency?.name || 'One-Time',
      frequency_discount_percent: Number(selectedFrequency?.discount_percent) || 0,
      frequency_interval_days: Number(selectedFrequency?.interval_days) || 0,
      frequency_discount: frequencyDiscount,
      base_price: basePrice || 0,
      selected_add_ons: selectedAddOns.map(id => {
        const a = addOns.find(x => x.id === id);
        return { id: a.id, name: a.name, price: a.price };
      }),
      add_ons_total: addOnsTotal,
      subtotal,
      total,
      guest_first_name: firstName.trim(),
      guest_last_name: lastName.trim(),
      guest_email: email.trim(),
      guest_phone: phone.trim(),
      special_instructions: specialInstructions.trim(),
      assigned_worker_id: assignedWorkerId || null,
    };
    localStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    router.push('/checkout');
  };

  const getSelectStyle = (fieldName) => ({
    width: '100%', padding: '18px 20px', fontSize: 16,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    border: focusedField === fieldName ? `2px solid ${brand.gold}` : `1px solid ${brand.border}`,
    borderRadius: 12, background: brand.bgCard, color: brand.text, cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23C9B037' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 18px center', backgroundSize: '18px',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(201, 176, 55, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', outline: 'none',
  });

  const getInputStyle = (fieldName) => ({
    width: '100%', padding: '18px 20px', fontSize: 16,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    border: focusedField === fieldName ? `2px solid ${brand.gold}` : `1px solid ${brand.border}`,
    borderRadius: 12, background: brand.bgCard, color: brand.text, boxSizing: 'border-box',
    boxShadow: focusedField === fieldName ? '0 0 0 4px rgba(201, 176, 55, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)' : '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', outline: 'none',
  });

  const labelStyle = {
    display: 'block', fontSize: 13, fontWeight: 600, color: brand.textLight,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.08em',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const toggleAddOn = (id) => {
    setSelectedAddOns(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (dataLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}>
        <p style={{ color: brand.textLight }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(180deg, ${brand.bg} 0%, ${brand.primaryLight} 100%)`, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <header className="booking-header" style={{ padding: '20px 40px', background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${brand.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
        </Link>
        <div className="desktop-nav">
          <Link href="/dashboard" style={{ padding: '12px 28px', fontSize: 14, fontWeight: 500, background: 'transparent', border: `1px solid ${brand.border}`, borderRadius: 8, textDecoration: 'none', color: brand.text, letterSpacing: '0.02em' }}>
            My Bookings
          </Link>
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
          <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ padding: '14px 16px', fontSize: 16, fontWeight: 500, border: `1px solid ${brand.border}`, borderRadius: 8, textDecoration: 'none', color: brand.text, textAlign: 'center' }}>
            My Bookings
          </Link>
        </div>
      </header>

      <main className="booking-main" style={{ maxWidth: 580, margin: '0 auto', padding: '64px 24px 100px' }}>
        <div style={{ width: 60, height: 3, background: `linear-gradient(90deg, ${brand.gold}, ${brand.primary})`, margin: '0 auto 32px', borderRadius: 2 }} />
        <h1 style={{ fontSize: 42, fontWeight: 300, textAlign: 'center', marginBottom: 12, color: brand.text, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>Schedule Your Service</h1>
        <p style={{ textAlign: 'center', color: brand.textLight, marginBottom: 56, fontSize: 17 }}>Premium window care for discerning residences</p>

        {/* Rebook Banner */}
        {isRebook && rebookBuildingName && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: '20px 28px', marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, background: brand.goldLight, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand.gold} strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#92400E', marginBottom: 2 }}>Booking again at {rebookBuildingName}</p>
                <p style={{ fontSize: 13, color: '#A16207' }}>Your property and contact info are pre-filled. Just pick a date and time.</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsRebook(false);
                setNeighborhood(''); setBuildingId(''); setFloorPlanId(''); setUnit('');
                setBuildings([]); setFloorPlans([]);
                setUnitLookupResult(null); setShowFloorPlanFallback(false);
                setFirstName(''); setLastName(''); setEmail(''); setPhone('');
              }}
              style={{ fontSize: 13, fontWeight: 500, color: '#92400E', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}
            >
              Change property
            </button>
          </div>
        )}

        <div className="booking-form" style={{ background: brand.bgCard, borderRadius: 24, padding: '40px 36px', boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)', border: `1px solid ${brand.borderLight}` }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Neighborhood */}
            <div>
              <label style={labelStyle}>Neighborhood</label>
              <select value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); setBuildingId(''); setFloorPlanId(''); setUnit(''); setBuildings([]); setFloorPlans([]); setUnitLookupResult(null); setShowFloorPlanFallback(false); if (e.target.value) loadBuildings(e.target.value); }} onFocus={() => setFocusedField('neighborhood')} onBlur={() => setFocusedField(null)} style={getSelectStyle('neighborhood')}>
                <option value="">Select your neighborhood</option>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>

            {/* Building */}
            {neighborhood && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Building</label>
                <select value={buildingId} onChange={(e) => { setBuildingId(e.target.value); setFloorPlanId(''); setFloorPlans([]); setUnit(''); setUnitLookupResult(null); setShowFloorPlanFallback(false); }} onFocus={() => setFocusedField('building')} onBlur={() => setFocusedField(null)} style={getSelectStyle('building')}>
                  <option value="">Select your building</option>
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            {/* Unit Number */}
            {buildingId && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Unit Number</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => {
                    const val = e.target.value;
                    setUnit(val);
                    setUnitLookupResult(null);
                    setShowFloorPlanFallback(false);
                    setFloorPlanId('');
                  }}
                  onBlur={() => {
                    setFocusedField(null);
                    if (unit.trim() && buildingId) {
                      lookupUnitLine(buildingId, unit);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && unit.trim() && buildingId) {
                      e.preventDefault();
                      lookupUnitLine(buildingId, unit);
                    }
                  }}
                  onFocus={() => setFocusedField('unit')}
                  placeholder="e.g. 2207 or 57D"
                  style={getInputStyle('unit')}
                />

                {/* Loading indicator */}
                {unitLookupLoading && (
                  <div style={{ marginTop: 10, padding: '12px 16px', fontSize: 14, color: brand.textLight, background: brand.bgCard, borderRadius: 10, border: `1px solid ${brand.border}` }}>
                    Looking up unit...
                  </div>
                )}

                {/* Unit found - show floor plan info */}
                {unitLookupResult?.found && (
                  <div style={{
                    marginTop: 10, padding: '14px 18px', borderRadius: 12,
                    background: '#F0FDF4', border: '1px solid #BBF7D0',
                    display: 'flex', alignItems: 'center', gap: 12,
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                    <span style={{ fontSize: 15, fontWeight: 500, color: '#15803D' }}>
                      Unit {unit.trim()} — {unitLookupResult.floorPlan.name} — ${unitLookupResult.displayPrice}
                    </span>
                  </div>
                )}

                {/* Unit not found - show message and fallback dropdown */}
                {unitLookupResult && !unitLookupResult.found && !unitLookupLoading && (
                  <div style={{ marginTop: 10, animation: 'fadeIn 0.3s ease' }}>
                    <div style={{
                      padding: '12px 16px', borderRadius: 10,
                      background: '#FFFBEB', border: '1px solid #FDE68A',
                      fontSize: 14, color: '#92400E', marginBottom: 12,
                    }}>
                      Unit not recognized
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Floor Plan Fallback Dropdown (only shown when unit not recognized) */}
            {showFloorPlanFallback && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Select Floor Plan</label>
                <select value={floorPlanId} onChange={(e) => setFloorPlanId(e.target.value)} onFocus={() => setFocusedField('floorPlan')} onBlur={() => setFocusedField(null)} style={getSelectStyle('floorPlan')}>
                  <option value="">Select floor plan</option>
                  {floorPlans.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
                </select>
              </div>
            )}

            {/* Date & Time */}
            {unitReady && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Preferred Date</label>
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
                    <div style={{ background: brand.bgCard, border: `1px solid ${brand.border}`, borderRadius: 16, padding: '20px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
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
                            width: 36, height: 36, borderRadius: 10, border: 'none',
                            background: canGoPrev ? brand.primaryLight : 'transparent',
                            cursor: canGoPrev ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: canGoPrev ? 1 : 0.25, transition: 'all 0.15s',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                        </button>
                        <span style={{ fontSize: 16, fontWeight: 600, color: brand.text, letterSpacing: '-0.01em', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
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
                            width: 36, height: 36, borderRadius: 10, border: 'none',
                            background: canGoNext ? brand.primaryLight : 'transparent',
                            cursor: canGoNext ? 'pointer' : 'default',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: canGoNext ? 1 : 0.25, transition: 'all 0.15s',
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={brand.text} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>

                      {/* Day name headers */}
                      <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, marginBottom: 4 }}>
                        {dayNames.map(d => (
                          <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: brand.textMuted, padding: '6px 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {d}
                          </div>
                        ))}
                      </div>

                      {/* Day cells */}
                      <div className="cal-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3 }}>
                        {cells.map((day, i) => {
                          if (day === null) return <div key={`empty-${i}`} />;

                          const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                          const cellDate = new Date(calendarYear, calendarMonth, day);
                          const isPast = cellDate < todayObj;
                          const isBeyondMax = maxDateObj && cellDate > maxDateObj;
                          const disabled = isPast || isBeyondMax;
                          const isSelected = date === dateStr;
                          const isToday = cellDate.getTime() === todayObj.getTime();

                          return (
                            <button
                              key={day}
                              disabled={disabled}
                              onClick={() => { setDate(dateStr); setTime(''); }}
                              className="cal-day"
                              style={{
                                width: '100%', aspectRatio: '1', border: 'none',
                                borderRadius: 10,
                                background: isSelected ? '#7B8EC8' : 'transparent',
                                color: isSelected ? '#fff' : disabled ? '#D1D5DB' : brand.text,
                                fontSize: 14, fontWeight: isSelected || isToday ? 700 : 500,
                                cursor: disabled ? 'default' : 'pointer',
                                transition: 'all 0.15s ease',
                                position: 'relative',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                                boxShadow: isSelected ? '0 2px 8px rgba(123, 142, 200, 0.4)' : 'none',
                                transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                              }}
                            >
                              {day}
                              {isToday && !isSelected && (
                                <div style={{ position: 'absolute', bottom: 3, left: '50%', transform: 'translateX(-50%)', width: 4, height: 4, borderRadius: '50%', background: '#7B8EC8' }} />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Time slot panel — expands below calendar when date is selected */}
                      <div className="cal-time-panel" style={{
                        overflow: 'hidden',
                        maxHeight: date ? 200 : 0,
                        opacity: date ? 1 : 0,
                        marginTop: date ? 16 : 0,
                        paddingTop: date ? 16 : 0,
                        borderTop: date ? `1px solid ${brand.borderLight}` : 'none',
                        transition: 'max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease, margin-top 0.3s ease, padding-top 0.3s ease',
                      }}>
                        {date && (
                          <>
                            {slotsLoading ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '12px 0', color: brand.textLight }}>
                                <div style={{ width: 16, height: 16, border: `2px solid ${brand.borderLight}`, borderTopColor: '#7B8EC8', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                                <span style={{ fontSize: 14, fontWeight: 500 }}>Checking availability...</span>
                              </div>
                            ) : slotsMessage ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', background: '#FFFBEB', borderRadius: 10, border: '1px solid #FDE68A' }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                <span style={{ fontSize: 14, color: '#92400E', fontWeight: 500 }}>{slotsMessage}</span>
                              </div>
                            ) : (
                              <div>
                                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: brand.textMuted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  Available times for {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </label>
                                <div style={{ position: 'relative' }}>
                                  <select
                                    value={time}
                                    onChange={(e) => {
                                      setTime(e.target.value);
                                      const slot = availableSlots.find(s => s.label === e.target.value);
                                      setAssignedWorkerId(slot && slot.workerIds && slot.workerIds.length > 0 ? slot.workerIds[0] : null);
                                    }}
                                    style={{
                                      width: '100%', padding: '14px 44px 14px 16px', fontSize: 15, fontWeight: 600,
                                      border: time ? '2px solid #7B8EC8' : `1px solid ${brand.border}`,
                                      borderRadius: 12, background: time ? '#EEF1FC' : brand.bgCard,
                                      color: time ? brand.text : brand.textLight,
                                      cursor: 'pointer', appearance: 'none', outline: 'none',
                                      transition: 'all 0.2s ease', boxSizing: 'border-box',
                                      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                                    }}
                                  >
                                    <option value="">Select a time</option>
                                    {availableSlots.map(slot => (
                                      <option key={slot.label} value={slot.label}>{slot.label}</option>
                                    ))}
                                  </select>
                                  <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={time ? '#7B8EC8' : brand.textMuted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Frequency */}
            {time && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Frequency</label>
                <select value={frequencyId} onChange={(e) => setFrequencyId(e.target.value)} onFocus={() => setFocusedField('frequency')} onBlur={() => setFocusedField(null)} style={getSelectStyle('frequency')}>
                  {frequencies.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}{Number(f.discount_percent) > 0 ? ` - ${f.discount_percent}% off` : ''}
                    </option>
                  ))}
                </select>
                {selectedFrequency && Number(selectedFrequency.discount_percent) > 0 && (
                  <p style={{ fontSize: 13, color: brand.gold, fontWeight: 600, marginTop: 8 }}>
                    Save {selectedFrequency.discount_percent}% with {selectedFrequency.name.toLowerCase()} service
                  </p>
                )}
              </div>
            )}

            {/* Add-Ons */}
            {time && addonsSectionVisible && addOns.length > 0 && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Premium Add-Ons</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {addOns.map(addon => (
                    <div key={addon.id} onClick={() => toggleAddOn(addon.id)} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderRadius: 12,
                      border: selectedAddOns.includes(addon.id) ? `2px solid ${brand.gold}` : `1px solid ${brand.border}`,
                      background: selectedAddOns.includes(addon.id) ? brand.goldLight : brand.bgCard,
                      cursor: 'pointer', transition: 'all 0.3s ease',
                      boxShadow: selectedAddOns.includes(addon.id) ? '0 4px 12px rgba(201, 176, 55, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.02)',
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 500, color: brand.text }}>{addon.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: selectedAddOns.includes(addon.id) ? brand.goldDark : brand.textLight }}>+${addon.price}</span>
                        <div style={{
                          width: 22, height: 22, borderRadius: 6,
                          border: selectedAddOns.includes(addon.id) ? `2px solid ${brand.gold}` : `2px solid ${brand.border}`,
                          background: selectedAddOns.includes(addon.id) ? brand.gold : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease'
                        }}>
                          {selectedAddOns.includes(addon.id) && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        {serviceSelected && (
          <div style={{ marginTop: 32, background: brand.bgCard, borderRadius: 24, padding: '40px 36px', boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)', border: `1px solid ${brand.borderLight}`, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: brand.text, marginBottom: 4, fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 28, fontWeight: 400 }}>Your Information</h2>
              <p style={{ fontSize: 14, color: brand.textLight }}>How can we reach you about your booking?</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>First Name *</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} onFocus={() => setFocusedField('firstName')} onBlur={() => setFocusedField(null)} placeholder="First name" style={getInputStyle('firstName')} />
                </div>
                <div>
                  <label style={labelStyle}>Last Name *</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} onFocus={() => setFocusedField('lastName')} onBlur={() => setFocusedField(null)} placeholder="Last name" style={getInputStyle('lastName')} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} placeholder="you@email.com" style={getInputStyle('email')} />
              </div>
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} onFocus={() => setFocusedField('phone')} onBlur={() => setFocusedField(null)} placeholder="(555) 123-4567" style={getInputStyle('phone')} />
              </div>
              <div>
                <label style={labelStyle}>Special Instructions</label>
                <textarea value={specialInstructions} onChange={(e) => setSpecialInstructions(e.target.value)} onFocus={() => setFocusedField('specialInstructions')} onBlur={() => setFocusedField(null)} placeholder="Any special requests or access instructions..." rows={3} style={{ ...getInputStyle('specialInstructions'), resize: 'vertical', minHeight: 80, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }} />
              </div>
            </div>
          </div>
        )}

        {/* Total & Book */}
        {time && (
          <div style={{ marginTop: 32, padding: 32, background: brand.bgCard, borderRadius: 20, boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)', border: `1px solid ${brand.borderLight}`, animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, color: brand.textLight }}>
                <span>Window Cleaning ({unitLookupResult?.found ? unitLookupResult.floorPlan.name : selectedPlan?.name})</span>
                <span>${basePrice}</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, color: brand.textLight }}>
                  <span>Add-Ons ({selectedAddOns.length})</span>
                  <span>${addOnsTotal}</span>
                </div>
              )}
              {selectedFrequency && Number(selectedFrequency.interval_days) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 15, color: brand.gold, fontWeight: 500 }}>
                  <span>Frequency: {selectedFrequency.name}</span>
                  <span>-{selectedFrequency.discount_percent}% (−${frequencyDiscount.toFixed(2)})</span>
                </div>
              )}
              <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${brand.border}, transparent)`, margin: '16px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: brand.textLight, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total</span>
                <div style={{ textAlign: 'right' }}>
                  {frequencyDiscount > 0 && (
                    <span style={{ fontSize: 16, color: brand.textMuted, textDecoration: 'line-through', marginRight: 12 }}>${subtotal}</span>
                  )}
                  <span style={{ fontSize: 36, fontWeight: 300, color: brand.text, fontFamily: "'Cormorant Garamond', Georgia, serif" }}>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button disabled={!canBook} onClick={handleContinue} style={{
              width: '100%', padding: '20px 32px', fontSize: 16, fontWeight: 600,
              background: canBook ? `linear-gradient(135deg, ${brand.gold} 0%, ${brand.goldDark} 100%)` : brand.border,
              border: 'none', borderRadius: 12, color: canBook ? '#FFFFFF' : '#999',
              cursor: canBook ? 'pointer' : 'not-allowed', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: canBook ? '0 4px 20px rgba(201, 176, 55, 0.35)' : 'none',
              letterSpacing: '0.04em', textTransform: 'uppercase'
            }}
            onMouseOver={(e) => { if (canBook) { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 8px 30px rgba(201, 176, 55, 0.45)'; }}}
            onMouseOut={(e) => { if (canBook) { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = '0 4px 20px rgba(201, 176, 55, 0.35)'; }}}>
              Continue to Payment
            </button>

            <p style={{ fontSize: 13, color: brand.textMuted, textAlign: 'center', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand.textMuted} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Your card will be charged after service completion
            </p>
          </div>
        )}

        <div className="trust-indicators" style={{ marginTop: 48, display: 'flex', justifyContent: 'center', gap: 40, opacity: 0.6 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: brand.textLight, marginBottom: 4 }}>Insured</div>
            <div style={{ fontSize: 11, color: brand.textMuted }}>&amp; Bonded</div>
          </div>
          <div style={{ width: 1, background: brand.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: brand.textLight, marginBottom: 4 }}>5-Star</div>
            <div style={{ fontSize: 11, color: brand.textMuted }}>Service</div>
          </div>
          <div style={{ width: 1, background: brand.border }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: brand.textLight, marginBottom: 4 }}>24hr</div>
            <div style={{ fontSize: 11, color: brand.textMuted }}>Cancellation</div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        select option { padding: 12px; }
        .cal-day:not(:disabled):hover {
          background: #E8EDFC !important;
        }
        @media (max-width: 480px) {
          .cal-grid { gap: 1px !important; }
          .cal-day { font-size: 13px !important; border-radius: 8px !important; }
          .cal-time-panel { max-height: 220px !important; }
        }
      `}</style>
    </div>
  );
}

export default function BookingFlow() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FAFBFF' }}>
        <p style={{ color: '#6B7280' }}>Loading...</p>
      </div>
    }>
      <BookingFlowInner />
    </Suspense>
  );
}
