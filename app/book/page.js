'use client';
import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
    </div>
  );
}

const timeSlots = [
  '8:00 AM – 11:00 AM',
  '11:00 AM – 2:00 PM',
  '2:00 PM – 5:00 PM',
  '5:00 PM – 8:00 PM',
];

function BookingFlowInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [neighborhoods, setNeighborhoods] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [floorPlans, setFloorPlans] = useState([]);
  const [addOns, setAddOns] = useState([]);
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [nRes, aoRes, freqRes] = await Promise.all([
      supabase.from('neighborhoods').select('*').order('name'),
      supabase.from('add_ons').select('*').order('name'),
      supabase.from('frequencies').select('*').order('sort_order'),
    ]);
    const neighborhoodsData = nRes.data || [];
    setNeighborhoods(neighborhoodsData);
    setAddOns(aoRes.data || []);
    const freqData = freqRes.data || [];
    setFrequencies(freqData);
    // Default to the first frequency (One-Time) if available
    const oneTime = freqData.find(f => f.interval_days === 0);
    if (oneTime) setFrequencyId(oneTime.id);

    // Check for rebook info
    const isRebookParam = searchParams.get('rebook') === 'true';
    const storedRebook = localStorage.getItem('rebookInfo');
    if (isRebookParam && storedRebook) {
      try {
        const rebook = JSON.parse(storedRebook);
        setIsRebook(true);
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
              .order('name');
            setBuildings(bldgs || []);
            setBuildingId(rebook.building_id);

            // Load floor plans for this building
            const { data: fps } = await supabase
              .from('floor_plans')
              .select('*')
              .eq('building_id', rebook.building_id)
              .order('price');
            setFloorPlans(fps || []);

            if (rebook.floor_plan_id) setFloorPlanId(rebook.floor_plan_id);
          }
        }

        if (rebook.unit_number) setUnit(rebook.unit_number);

        // Clean up — keep it in localStorage for future "Book Again" but remove the rebook query param behavior
        localStorage.removeItem('rebookInfo');
      } catch (e) {
        // Invalid rebook data, ignore
      }
    }

    setDataLoading(false);
  };

  const loadBuildings = async (neighborhoodId) => {
    const { data } = await supabase.from('buildings').select('*').eq('neighborhood_id', neighborhoodId).order('name');
    setBuildings(data || []);
  };

  const loadFloorPlans = async (bId) => {
    const { data } = await supabase.from('floor_plans').select('*').eq('building_id', bId).order('price');
    setFloorPlans(data || []);
  };

  const selectedPlan = floorPlans.find(p => String(p.id) === String(floorPlanId));
  const selectedBuilding = buildings.find(b => String(b.id) === String(buildingId));
  const selectedNeighborhood = neighborhoods.find(n => String(n.id) === String(neighborhood));
  const selectedFrequency = frequencies.find(f => String(f.id) === String(frequencyId));

  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const addon = addOns.find(a => a.id === id);
    return sum + (Number(addon?.price) || 0);
  }, 0);

  const subtotal = (Number(selectedPlan?.price) || 0) + addOnsTotal;
  const frequencyDiscount = selectedFrequency && Number(selectedFrequency.discount_percent) > 0
    ? Math.round(subtotal * Number(selectedFrequency.discount_percent) / 100 * 100) / 100
    : 0;
  const total = Math.max(0, subtotal - frequencyDiscount);

  const serviceSelected = neighborhood && buildingId && floorPlanId && unit && date && time;
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
      floor_plan_id: floorPlanId,
      floor_plan_name: selectedPlan?.name || '',
      unit, date, time_slot: time,
      frequency_id: frequencyId,
      frequency_name: selectedFrequency?.name || 'One-Time',
      frequency_discount_percent: Number(selectedFrequency?.discount_percent) || 0,
      frequency_interval_days: Number(selectedFrequency?.interval_days) || 0,
      frequency_discount: frequencyDiscount,
      base_price: selectedPlan?.price || 0,
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
              <select value={neighborhood} onChange={(e) => { setNeighborhood(e.target.value); setBuildingId(''); setFloorPlanId(''); setBuildings([]); setFloorPlans([]); if (e.target.value) loadBuildings(e.target.value); }} onFocus={() => setFocusedField('neighborhood')} onBlur={() => setFocusedField(null)} style={getSelectStyle('neighborhood')}>
                <option value="">Select your neighborhood</option>
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>

            {/* Building */}
            {neighborhood && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Building</label>
                <select value={buildingId} onChange={(e) => { setBuildingId(e.target.value); setFloorPlanId(''); setFloorPlans([]); if (e.target.value) loadFloorPlans(e.target.value); }} onFocus={() => setFocusedField('building')} onBlur={() => setFocusedField(null)} style={getSelectStyle('building')}>
                  <option value="">Select your building</option>
                  {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            )}

            {/* Floor Plan */}
            {buildingId && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Floor Plan</label>
                <select value={floorPlanId} onChange={(e) => setFloorPlanId(e.target.value)} onFocus={() => setFocusedField('floorPlan')} onBlur={() => setFocusedField(null)} style={getSelectStyle('floorPlan')}>
                  <option value="">Select floor plan</option>
                  {floorPlans.map(p => <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>)}
                </select>
              </div>
            )}

            {/* Unit */}
            {floorPlanId && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Unit Number</label>
                <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} onFocus={() => setFocusedField('unit')} onBlur={() => setFocusedField(null)} placeholder="e.g. 2405" style={getInputStyle('unit')} />
              </div>
            )}

            {/* Date */}
            {unit && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Preferred Date</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} onFocus={() => setFocusedField('date')} onBlur={() => setFocusedField(null)} min={today} style={getInputStyle('date')} />
              </div>
            )}

            {/* Time */}
            {date && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Preferred Time</label>
                <select value={time} onChange={(e) => setTime(e.target.value)} onFocus={() => setFocusedField('time')} onBlur={() => setFocusedField(null)} style={getSelectStyle('time')}>
                  <option value="">Select time slot</option>
                  {timeSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
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
            {time && (
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
                <span>Window Cleaning ({selectedPlan?.name})</span>
                <span>${selectedPlan?.price}</span>
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
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.7); cursor: pointer; }
        select option { padding: 12px; }
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
