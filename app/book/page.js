'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
    </div>
  );
}

const neighborhoods = [
  { id: 'brickell', name: 'Brickell' },
  { id: 'edgewater', name: 'Edgewater' },
  { id: 'midtown', name: 'Midtown' },
  { id: 'wynwood', name: 'Wynwood' },
  { id: 'downtown', name: 'Downtown' },
  { id: 'miami-beach', name: 'Miami Beach' },
];

const buildings = [
  { id: 1, name: 'Brickell Heights', neighborhood: 'brickell' },
  { id: 2, name: 'SLS Brickell', neighborhood: 'brickell' },
  { id: 3, name: 'Rise Brickell', neighborhood: 'brickell' },
  { id: 4, name: 'AMLI Midtown 29', neighborhood: 'midtown' },
  { id: 5, name: 'Gio Midtown', neighborhood: 'midtown' },
  { id: 6, name: 'Edgewater Panorama', neighborhood: 'edgewater' },
  { id: 7, name: 'Paraiso Bay', neighborhood: 'edgewater' },
  { id: 8, name: 'Strata Wynwood', neighborhood: 'wynwood' },
  { id: 9, name: 'Wynwood 25', neighborhood: 'wynwood' },
];

const floorPlans = {
  1: [
    { id: 1, name: 'Studio', price: 179 },
    { id: 2, name: '1 Bed / 1 Bath', price: 239 },
    { id: 3, name: '2 Bed / 2 Bath', price: 339 },
    { id: 4, name: '3 Bed / 2 Bath', price: 439 },
  ],
  2: [
    { id: 5, name: 'Studio', price: 189 },
    { id: 6, name: '1 Bed / 1 Bath', price: 259 },
    { id: 7, name: '2 Bed / 2 Bath', price: 379 },
  ],
  3: [
    { id: 8, name: '1 Bed / 1 Bath', price: 249 },
    { id: 9, name: '2 Bed / 2 Bath', price: 349 },
  ],
  4: [
    { id: 10, name: 'Studio', price: 169 },
    { id: 11, name: '1 Bed / 1 Bath', price: 229 },
    { id: 12, name: '2 Bed / 2 Bath', price: 349 },
  ],
  5: [
    { id: 13, name: 'Studio', price: 169 },
    { id: 14, name: '1 Bed / 1 Bath', price: 229 },
    { id: 15, name: '2 Bed / 2 Bath', price: 329 },
    { id: 16, name: 'Penthouse', price: 579 },
  ],
  6: [
    { id: 17, name: '1 Bed / 1 Bath', price: 219 },
    { id: 18, name: '2 Bed / 2 Bath', price: 319 },
    { id: 19, name: '3 Bed / 2.5 Bath', price: 449 },
  ],
  7: [
    { id: 20, name: '1 Bed / 1 Bath', price: 239 },
    { id: 21, name: '2 Bed / 2 Bath', price: 359 },
    { id: 22, name: '3 Bed / 3 Bath', price: 489 },
  ],
  8: [
    { id: 23, name: 'Studio', price: 149 },
    { id: 24, name: '1 Bed / 1 Bath', price: 209 },
    { id: 25, name: '2 Bed / 2 Bath', price: 289 },
  ],
  9: [
    { id: 26, name: 'Studio', price: 159 },
    { id: 27, name: '1 Bed / 1 Bath', price: 219 },
    { id: 28, name: '2 Bed / 2 Bath', price: 309 },
  ],
};

const addOns = [
  { id: 1, name: 'Balcony Glass', price: 49, icon: '◈' },
  { id: 2, name: 'Mirror Cleaning', price: 29, icon: '◇' },
  { id: 3, name: 'Track Deep Clean', price: 39, icon: '◈' },
  { id: 4, name: 'Screen Cleaning', price: 59, icon: '◇' },
  { id: 5, name: 'Hard Water Treatment', price: 79, icon: '◈' },
];

const timeSlots = [
  '8:00 AM – 11:00 AM',
  '11:00 AM – 2:00 PM',
  '2:00 PM – 5:00 PM',
  '5:00 PM – 8:00 PM',
];

export default function BookingFlow() {
  const router = useRouter();
  const [neighborhood, setNeighborhood] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [floorPlanId, setFloorPlanId] = useState('');
  const [unit, setUnit] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [focusedField, setFocusedField] = useState(null);

  const brand = {
    primary: '#B8C5F2',
    primaryDark: '#9AA8E0',
    primaryLight: '#E8EDFC',
    gold: '#C9B037',
    goldLight: '#F5F0DC',
    goldDark: '#A69028',
    text: '#1F2937',
    textLight: '#6B7280',
    textMuted: '#9CA3AF',
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    bg: '#FAFBFF',
    bgCard: '#FFFFFF',
    success: '#059669',
  };

  const filteredBuildings = buildings.filter(b => b.neighborhood === neighborhood);
  const availableFloorPlans = buildingId ? floorPlans[buildingId] || [] : [];
  const selectedPlan = availableFloorPlans.find(p => p.id === Number(floorPlanId));

  const addOnsTotal = selectedAddOns.reduce((sum, id) => {
    const addon = addOns.find(a => a.id === id);
    return sum + (addon?.price || 0);
  }, 0);

  const total = (selectedPlan?.price || 0) + addOnsTotal;
  const canBook = neighborhood && buildingId && floorPlanId && unit && date && time;
  const today = new Date().toISOString().split('T')[0];

  const getSelectStyle = (fieldName) => ({
    width: '100%',
    padding: '18px 20px',
    fontSize: 16,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    border: focusedField === fieldName
      ? `2px solid ${brand.gold}`
      : `1px solid ${brand.border}`,
    borderRadius: 12,
    background: brand.bgCard,
    color: brand.text,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23C9B037' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 18px center',
    backgroundSize: '18px',
    boxShadow: focusedField === fieldName
      ? '0 0 0 4px rgba(201, 176, 55, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)'
      : '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
  });

  const getInputStyle = (fieldName) => ({
    width: '100%',
    padding: '18px 20px',
    fontSize: 16,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    border: focusedField === fieldName
      ? `2px solid ${brand.gold}`
      : `1px solid ${brand.border}`,
    borderRadius: 12,
    background: brand.bgCard,
    color: brand.text,
    boxSizing: 'border-box',
    boxShadow: focusedField === fieldName
      ? '0 0 0 4px rgba(201, 176, 55, 0.1), 0 4px 12px rgba(0, 0, 0, 0.05)'
      : '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
  });

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: brand.textLight,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  };

  const toggleAddOn = (id) => {
    setSelectedAddOns(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${brand.bg} 0%, ${brand.primaryLight} 100%)`,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${brand.borderLight}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 22, fontWeight: 600, color: brand.text }}>BetterView</span>
        </Link>
        <Link href="/dashboard" style={{
          padding: '12px 28px',
          fontSize: 14,
          fontWeight: 500,
          background: 'transparent',
          border: `1px solid ${brand.border}`,
          borderRadius: 8,
          cursor: 'pointer',
          textDecoration: 'none',
          color: brand.text,
          transition: 'all 0.3s ease',
          letterSpacing: '0.02em'
        }}
        onMouseOver={(e) => {
          e.target.style.borderColor = brand.gold;
          e.target.style.color = brand.gold;
        }}
        onMouseOut={(e) => {
          e.target.style.borderColor = brand.border;
          e.target.style.color = brand.text;
        }}>
          My Bookings
        </Link>
      </header>

      {/* Main */}
      <main style={{
        maxWidth: 580,
        margin: '0 auto',
        padding: '64px 24px 100px'
      }}>
        {/* Decorative line */}
        <div style={{
          width: 60,
          height: 3,
          background: `linear-gradient(90deg, ${brand.gold}, ${brand.primary})`,
          margin: '0 auto 32px',
          borderRadius: 2
        }} />

        <h1 style={{
          fontSize: 42,
          fontWeight: 300,
          textAlign: 'center',
          marginBottom: 12,
          color: brand.text,
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          letterSpacing: '0.01em'
        }}>
          Schedule Your Service
        </h1>
        <p style={{
          textAlign: 'center',
          color: brand.textLight,
          marginBottom: 56,
          fontSize: 17,
          fontWeight: 400,
          letterSpacing: '0.01em'
        }}>
          Premium window care for discerning residences
        </p>

        {/* Form Card */}
        <div style={{
          background: brand.bgCard,
          borderRadius: 24,
          padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${brand.borderLight}`
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Neighborhood */}
            <div>
              <label style={labelStyle}>Neighborhood</label>
              <select
                value={neighborhood}
                onChange={(e) => {
                  setNeighborhood(e.target.value);
                  setBuildingId('');
                  setFloorPlanId('');
                }}
                onFocus={() => setFocusedField('neighborhood')}
                onBlur={() => setFocusedField(null)}
                style={getSelectStyle('neighborhood')}
              >
                <option value="">Select your neighborhood</option>
                {neighborhoods.map(n => (
                  <option key={n.id} value={n.id}>{n.name}</option>
                ))}
              </select>
            </div>

            {/* Building */}
            {neighborhood && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Building</label>
                <select
                  value={buildingId}
                  onChange={(e) => {
                    setBuildingId(e.target.value);
                    setFloorPlanId('');
                  }}
                  onFocus={() => setFocusedField('building')}
                  onBlur={() => setFocusedField(null)}
                  style={getSelectStyle('building')}
                >
                  <option value="">Select your building</option>
                  {filteredBuildings.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Floor Plan */}
            {buildingId && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Floor Plan</label>
                <select
                  value={floorPlanId}
                  onChange={(e) => setFloorPlanId(e.target.value)}
                  onFocus={() => setFocusedField('floorPlan')}
                  onBlur={() => setFocusedField(null)}
                  style={getSelectStyle('floorPlan')}
                >
                  <option value="">Select floor plan</option>
                  {availableFloorPlans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ${p.price}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Unit */}
            {floorPlanId && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Unit Number</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  onFocus={() => setFocusedField('unit')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="e.g. 2405"
                  style={getInputStyle('unit')}
                />
              </div>
            )}

            {/* Date */}
            {unit && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Preferred Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onFocus={() => setFocusedField('date')}
                  onBlur={() => setFocusedField(null)}
                  min={today}
                  style={getInputStyle('date')}
                />
              </div>
            )}

            {/* Time */}
            {date && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Preferred Time</label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  onFocus={() => setFocusedField('time')}
                  onBlur={() => setFocusedField(null)}
                  style={getSelectStyle('time')}
                >
                  <option value="">Select time slot</option>
                  {timeSlots.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Add-Ons */}
            {time && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <label style={labelStyle}>Premium Add-Ons</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {addOns.map(addon => (
                    <div
                      key={addon.id}
                      onClick={() => toggleAddOn(addon.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderRadius: 12,
                        border: selectedAddOns.includes(addon.id)
                          ? `2px solid ${brand.gold}`
                          : `1px solid ${brand.border}`,
                        background: selectedAddOns.includes(addon.id)
                          ? brand.goldLight
                          : brand.bgCard,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: selectedAddOns.includes(addon.id)
                          ? '0 4px 12px rgba(201, 176, 55, 0.15)'
                          : '0 2px 8px rgba(0, 0, 0, 0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <span style={{
                          color: selectedAddOns.includes(addon.id) ? brand.gold : brand.textMuted,
                          fontSize: 16,
                          transition: 'color 0.3s ease'
                        }}>
                          {addon.icon}
                        </span>
                        <span style={{
                          fontSize: 15,
                          fontWeight: 500,
                          color: brand.text
                        }}>
                          {addon.name}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{
                          fontSize: 15,
                          fontWeight: 600,
                          color: selectedAddOns.includes(addon.id) ? brand.goldDark : brand.textLight
                        }}>
                          +${addon.price}
                        </span>
                        <div style={{
                          width: 22,
                          height: 22,
                          borderRadius: 6,
                          border: selectedAddOns.includes(addon.id)
                            ? `2px solid ${brand.gold}`
                            : `2px solid ${brand.border}`,
                          background: selectedAddOns.includes(addon.id)
                            ? brand.gold
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.3s ease'
                        }}>
                          {selectedAddOns.includes(addon.id) && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
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

        {/* Total & Book */}
        {time && (
          <div style={{
            marginTop: 32,
            padding: 32,
            background: brand.bgCard,
            borderRadius: 20,
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
            border: `1px solid ${brand.borderLight}`,
            animation: 'fadeIn 0.4s ease'
          }}>
            {/* Price breakdown */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 12,
                fontSize: 15,
                color: brand.textLight
              }}>
                <span>Window Cleaning ({selectedPlan?.name})</span>
                <span>${selectedPlan?.price}</span>
              </div>
              {selectedAddOns.length > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                  fontSize: 15,
                  color: brand.textLight
                }}>
                  <span>Add-Ons ({selectedAddOns.length})</span>
                  <span>${addOnsTotal}</span>
                </div>
              )}
              <div style={{
                height: 1,
                background: `linear-gradient(90deg, transparent, ${brand.border}, transparent)`,
                margin: '16px 0'
              }} />
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: brand.textLight,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em'
                }}>
                  Total
                </span>
                <span style={{
                  fontSize: 36,
                  fontWeight: 300,
                  color: brand.text,
                  fontFamily: "'Cormorant Garamond', Georgia, serif"
                }}>
                  ${total}
                </span>
              </div>
            </div>

            <button
              disabled={!canBook}
              onClick={() => canBook && router.push('/checkout')}
              style={{
                width: '100%',
                padding: '20px 32px',
                fontSize: 16,
                fontWeight: 600,
                background: canBook
                  ? `linear-gradient(135deg, ${brand.gold} 0%, ${brand.goldDark} 100%)`
                  : brand.border,
                border: 'none',
                borderRadius: 12,
                color: canBook ? '#FFFFFF' : '#999',
                cursor: canBook ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: canBook
                  ? '0 4px 20px rgba(201, 176, 55, 0.35)'
                  : 'none',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
              onMouseOver={(e) => {
                if (canBook) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(201, 176, 55, 0.45)';
                }
              }}
              onMouseOut={(e) => {
                if (canBook) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(201, 176, 55, 0.35)';
                }
              }}
            >
              Continue to Payment
            </button>

            <p style={{
              fontSize: 13,
              color: brand.textMuted,
              textAlign: 'center',
              marginTop: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand.textMuted} strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Your card will be charged after service completion
            </p>
          </div>
        )}

        {/* Trust indicators */}
        <div style={{
          marginTop: 48,
          display: 'flex',
          justifyContent: 'center',
          gap: 40,
          opacity: 0.6
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: brand.textLight, marginBottom: 4 }}>Insured</div>
            <div style={{ fontSize: 11, color: brand.textMuted }}>& Bonded</div>
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

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
          cursor: pointer;
        }

        select option {
          padding: 12px;
        }
      `}</style>
    </div>
  );
}
