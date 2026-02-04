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
  { id: 1, name: 'Balcony Glass (+$49)', price: 49 },
  { id: 2, name: 'Mirror Cleaning (+$29)', price: 29 },
  { id: 3, name: 'Track Deep Clean (+$39)', price: 39 },
  { id: 4, name: 'Screen Cleaning (+$59)', price: 59 },
  { id: 5, name: 'Hard Water Treatment (+$79)', price: 79 },
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

  const brand = {
    primary: '#B8C5F2',
    text: '#1a1a1a',
    textLight: '#666',
    border: '#e0e0e0',
    bg: '#fafafa',
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

  const selectStyle = {
    width: '100%',
    padding: '16px',
    fontSize: 16,
    border: `1px solid ${brand.border}`,
    borderRadius: 8,
    background: 'white',
    color: brand.text,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 16px center',
    backgroundSize: '20px',
  };

  const inputStyle = {
    width: '100%',
    padding: '16px',
    fontSize: 16,
    border: `1px solid ${brand.border}`,
    borderRadius: 8,
    background: 'white',
    color: brand.text,
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 14,
    fontWeight: 500,
    color: brand.text,
    marginBottom: 8,
  };

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      {/* Header */}
      <header style={{ 
        padding: '16px 32px', 
        background: 'white',
        borderBottom: `1px solid ${brand.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 22, fontWeight: 600, color: brand.text }}>BetterView</span>
        </Link>
        <Link href="/dashboard" style={{
          padding: '10px 20px',
          fontSize: 14,
          background: 'transparent',
          border: `1px solid ${brand.border}`,
          borderRadius: 6,
          cursor: 'pointer',
          textDecoration: 'none',
          color: brand.text
        }}>
          My Bookings
        </Link>
      </header>

      {/* Main */}
      <main style={{ 
        maxWidth: 520,
        margin: '0 auto',
        padding: '60px 24px'
      }}>
        <h1 style={{ 
          fontSize: 32, 
          fontWeight: 600, 
          textAlign: 'center',
          marginBottom: 8,
          color: brand.text
        }}>
          Book a Cleaning
        </h1>
        <p style={{ 
          textAlign: 'center', 
          color: brand.textLight,
          marginBottom: 48
        }}>
          Select your property and schedule
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              style={selectStyle}
            >
              <option value="">Select neighborhood</option>
              {neighborhoods.map(n => (
                <option key={n.id} value={n.id}>{n.name}</option>
              ))}
            </select>
          </div>

          {/* Building */}
          {neighborhood && (
            <div>
              <label style={labelStyle}>Building</label>
              <select 
                value={buildingId}
                onChange={(e) => {
                  setBuildingId(e.target.value);
                  setFloorPlanId('');
                }}
                style={selectStyle}
              >
                <option value="">Select building</option>
                {filteredBuildings.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Floor Plan */}
          {buildingId && (
            <div>
              <label style={labelStyle}>Floor Plan</label>
              <select 
                value={floorPlanId}
                onChange={(e) => setFloorPlanId(e.target.value)}
                style={selectStyle}
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
            <div>
              <label style={labelStyle}>Unit Number</label>
              <input 
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. 2405"
                style={inputStyle}
              />
            </div>
          )}

          {/* Date */}
          {unit && (
            <div>
              <label style={labelStyle}>Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={today}
                style={inputStyle}
              />
            </div>
          )}

          {/* Time */}
          {date && (
            <div>
              <label style={labelStyle}>Time</label>
              <select 
                value={time}
                onChange={(e) => setTime(e.target.value)}
                style={selectStyle}
              >
                <option value="">Select time</option>
                {timeSlots.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          )}

          {/* Add-Ons */}
          {time && (
            <div>
              <label style={labelStyle}>Add-Ons (optional)</label>
              <select 
                multiple
                value={selectedAddOns.map(String)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, opt => Number(opt.value));
                  setSelectedAddOns(values);
                }}
                style={{
                  ...selectStyle,
                  height: 160,
                  backgroundImage: 'none',
                  padding: 8
                }}
              >
                {addOns.map(a => (
                  <option key={a.id} value={a.id} style={{ padding: '12px' }}>
                    {a.name}
                  </option>
                ))}
              </select>
              <p style={{ fontSize: 13, color: brand.textLight, marginTop: 6 }}>
                Hold Cmd/Ctrl to select multiple
              </p>
            </div>
          )}

          {/* Total & Book */}
          {time && (
            <div style={{ 
              marginTop: 16,
              padding: 24,
              background: 'white',
              borderRadius: 12,
              border: `1px solid ${brand.border}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: 20
              }}>
                <span style={{ fontSize: 18, color: brand.text }}>Total</span>
                <span style={{ fontSize: 24, fontWeight: 700, color: brand.text }}>${total}</span>
              </div>

              <button
                disabled={!canBook}
                onClick={() => canBook && router.push('/checkout')}
                style={{
                  width: '100%',
                  padding: 18,
                  fontSize: 16,
                  fontWeight: 600,
                  background: canBook ? brand.primary : brand.border,
                  border: 'none',
                  borderRadius: 8,
                  color: canBook ? brand.text : '#999',
                  cursor: canBook ? 'pointer' : 'not-allowed'
                }}
              >
                Continue to Payment
              </button>

              <p style={{ 
                fontSize: 13, 
                color: brand.textLight, 
                textAlign: 'center',
                marginTop: 12 
              }}>
                Card charged after cleaning is complete
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
