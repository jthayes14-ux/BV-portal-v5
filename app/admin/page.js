'use client';
import React, { useState } from 'react';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
    </div>
  );
}

// Sample data
const initialNeighborhoods = [
  { id: 1, name: 'Brickell' },
  { id: 2, name: 'Edgewater' },
  { id: 3, name: 'Midtown' },
  { id: 4, name: 'Wynwood' },
];

const initialBuildings = [
  { id: 1, name: 'Brickell Heights', address: '45 SW 9th St', neighborhoodId: 1 },
  { id: 2, name: 'SLS Brickell', address: '1300 S Miami Ave', neighborhoodId: 1 },
  { id: 3, name: 'AMLI Midtown 29', address: '2901 NE 1st Ave', neighborhoodId: 3 },
  { id: 4, name: 'Strata Wynwood', address: '2916 N Miami Ave', neighborhoodId: 4 },
];

const initialFloorPlans = [
  { id: 1, name: 'Studio', price: 179, buildingId: 1 },
  { id: 2, name: '1 Bed / 1 Bath', price: 239, buildingId: 1 },
  { id: 3, name: '2 Bed / 2 Bath', price: 339, buildingId: 1 },
  { id: 4, name: 'Studio', price: 189, buildingId: 2 },
  { id: 5, name: '1 Bed / 1 Bath', price: 259, buildingId: 2 },
  { id: 6, name: 'Studio', price: 169, buildingId: 3 },
  { id: 7, name: '1 Bed / 1 Bath', price: 229, buildingId: 3 },
  { id: 8, name: 'Studio', price: 149, buildingId: 4 },
  { id: 9, name: '1 Bed / 1 Bath', price: 209, buildingId: 4 },
];

const initialAddOns = [
  { id: 1, name: 'Balcony Glass', price: 49 },
  { id: 2, name: 'Mirror Cleaning', price: 29 },
  { id: 3, name: 'Track Deep Clean', price: 39 },
  { id: 4, name: 'Screen Cleaning', price: 59 },
  { id: 5, name: 'Hard Water Treatment', price: 79 },
];

const initialBookings = [
  { id: 1, customer: 'John Smith', email: 'john@email.com', building: 'Brickell Heights', unit: '2405', floorPlan: '2 Bed / 2 Bath', date: '2026-02-15', time: '11:00 AM – 2:00 PM', total: 388, status: 'upcoming' },
  { id: 2, customer: 'Sarah Johnson', email: 'sarah@email.com', building: 'SLS Brickell', unit: '1802', floorPlan: '1 Bed / 1 Bath', date: '2026-02-14', time: '8:00 AM – 11:00 AM', total: 259, status: 'upcoming' },
  { id: 3, customer: 'Mike Chen', email: 'mike@email.com', building: 'AMLI Midtown 29', unit: '3201', floorPlan: 'Studio', date: '2026-02-10', time: '2:00 PM – 5:00 PM', total: 208, status: 'completed' },
];

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('bookings');
  const [neighborhoods, setNeighborhoods] = useState(initialNeighborhoods);
  const [buildings, setBuildings] = useState(initialBuildings);
  const [floorPlans, setFloorPlans] = useState(initialFloorPlans);
  const [addOns, setAddOns] = useState(initialAddOns);
  const [bookings] = useState(initialBookings);
  
  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({});
  
  // Filter states
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');

  const brand = {
    primary: '#B8C5F2',
    text: '#1a1a1a',
    textLight: '#666',
    border: '#e0e0e0',
    bg: '#fafafa',
    white: '#ffffff',
    danger: '#dc2626',
    success: '#22c55e',
  };

  const tabs = [
    { id: 'bookings', label: 'Bookings' },
    { id: 'neighborhoods', label: 'Neighborhoods' },
    { id: 'buildings', label: 'Buildings' },
    { id: 'floorplans', label: 'Floor Plans' },
    { id: 'addons', label: 'Add-Ons' },
  ];

  const buttonStyle = {
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 500,
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
  };

  const inputStyle = {
    padding: '10px 12px',
    fontSize: 14,
    border: `1px solid ${brand.border}`,
    borderRadius: 6,
    width: '100%',
    boxSizing: 'border-box',
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // CRUD handlers
  const handleAdd = (type) => {
    const newId = Date.now();
    switch(type) {
      case 'neighborhoods':
        setNeighborhoods([...neighborhoods, { id: newId, name: 'New Neighborhood' }]);
        setEditingId(`neighborhood-${newId}`);
        setEditValue({ name: 'New Neighborhood' });
        break;
      case 'buildings':
        setBuildings([...buildings, { id: newId, name: 'New Building', address: '', neighborhoodId: neighborhoods[0]?.id }]);
        setEditingId(`building-${newId}`);
        setEditValue({ name: 'New Building', address: '', neighborhoodId: neighborhoods[0]?.id });
        break;
      case 'floorplans':
        setFloorPlans([...floorPlans, { id: newId, name: 'New Floor Plan', price: 0, buildingId: buildings[0]?.id }]);
        setEditingId(`floorplan-${newId}`);
        setEditValue({ name: 'New Floor Plan', price: 0, buildingId: buildings[0]?.id });
        break;
      case 'addons':
        setAddOns([...addOns, { id: newId, name: 'New Add-On', price: 0 }]);
        setEditingId(`addon-${newId}`);
        setEditValue({ name: 'New Add-On', price: 0 });
        break;
    }
  };

  const handleSave = (type, id) => {
    switch(type) {
      case 'neighborhoods':
        setNeighborhoods(neighborhoods.map(n => n.id === id ? { ...n, ...editValue } : n));
        break;
      case 'buildings':
        setBuildings(buildings.map(b => b.id === id ? { ...b, ...editValue } : b));
        break;
      case 'floorplans':
        setFloorPlans(floorPlans.map(f => f.id === id ? { ...f, ...editValue } : f));
        break;
      case 'addons':
        setAddOns(addOns.map(a => a.id === id ? { ...a, ...editValue } : a));
        break;
    }
    setEditingId(null);
    setEditValue({});
  };

  const handleDelete = (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    switch(type) {
      case 'neighborhoods':
        setNeighborhoods(neighborhoods.filter(n => n.id !== id));
        break;
      case 'buildings':
        setBuildings(buildings.filter(b => b.id !== id));
        break;
      case 'floorplans':
        setFloorPlans(floorPlans.filter(f => f.id !== id));
        break;
      case 'addons':
        setAddOns(addOns.filter(a => a.id !== id));
        break;
    }
  };

  const filteredBuildings = selectedNeighborhood 
    ? buildings.filter(b => b.neighborhoodId === Number(selectedNeighborhood))
    : buildings;

  const filteredFloorPlans = selectedBuilding
    ? floorPlans.filter(f => f.buildingId === Number(selectedBuilding))
    : floorPlans;

  return (
    <div style={{ minHeight: '100vh', background: brand.bg }}>
      {/* Header */}
      <header style={{ 
        padding: '16px 32px', 
        background: brand.white,
        borderBottom: `1px solid ${brand.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontSize: 22, fontWeight: 600, color: brand.text }}>BetterView</span>
          <span style={{ 
            marginLeft: 12,
            padding: '4px 10px',
            background: brand.text,
            color: brand.white,
            borderRadius: 4,
            fontSize: 12,
            fontWeight: 600
          }}>
            ADMIN
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14, color: brand.textLight }}>jack@betterview.com</span>
          <button style={{
            ...buttonStyle,
            background: 'transparent',
            border: `1px solid ${brand.border}`,
            color: brand.text
          }}>
            Log Out
          </button>
        </div>
      </header>

      <div style={{ display: 'flex' }}>
        {/* Sidebar */}
        <aside style={{ 
          width: 220,
          background: brand.white,
          borderRight: `1px solid ${brand.border}`,
          minHeight: 'calc(100vh - 65px)',
          padding: '24px 0'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'block',
                width: '100%',
                padding: '12px 24px',
                textAlign: 'left',
                background: activeTab === tab.id ? brand.bg : 'transparent',
                border: 'none',
                borderLeft: activeTab === tab.id ? `3px solid ${brand.text}` : '3px solid transparent',
                fontSize: 15,
                fontWeight: activeTab === tab.id ? 600 : 400,
                color: brand.text,
                cursor: 'pointer'
              }}
            >
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: 32 }}>
          
          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Bookings</h1>
              </div>
              
              <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: brand.bg }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Customer</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Property</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Date & Time</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Total</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Status</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr key={booking.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontWeight: 500, color: brand.text }}>{booking.customer}</p>
                          <p style={{ fontSize: 13, color: brand.textLight }}>{booking.email}</p>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontWeight: 500, color: brand.text }}>{booking.building}</p>
                          <p style={{ fontSize: 13, color: brand.textLight }}>Unit {booking.unit} · {booking.floorPlan}</p>
                        </td>
                        <td style={{ padding: '16px' }}>
                          <p style={{ fontWeight: 500, color: brand.text }}>{formatDate(booking.date)}</p>
                          <p style={{ fontSize: 13, color: brand.textLight }}>{booking.time}</p>
                        </td>
                        <td style={{ padding: '16px', fontWeight: 600, color: brand.text }}>${booking.total}</td>
                        <td style={{ padding: '16px' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: 100,
                            fontSize: 13,
                            fontWeight: 500,
                            background: booking.status === 'upcoming' ? brand.primary : '#e8e8e8',
                            color: brand.text
                          }}>
                            {booking.status}
                          </span>
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {booking.status === 'upcoming' && (
                            <button style={{
                              ...buttonStyle,
                              background: brand.success,
                              color: brand.white
                            }}>
                              Mark Complete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NEIGHBORHOODS TAB */}
          {activeTab === 'neighborhoods' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Neighborhoods</h1>
                <button onClick={() => handleAdd('neighborhoods')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>
                  + Add Neighborhood
                </button>
              </div>
              
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
                            <input
                              style={inputStyle}
                              value={editValue.name || ''}
                              onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                            />
                          ) : (
                            <span style={{ fontWeight: 500, color: brand.text }}>{n.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px', color: brand.textLight }}>
                          {buildings.filter(b => b.neighborhoodId === n.id).length} buildings
                        </td>
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
          )}

          {/* BUILDINGS TAB */}
          {activeTab === 'buildings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Buildings</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                  <select
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    style={{ ...inputStyle, width: 180 }}
                  >
                    <option value="">All Neighborhoods</option>
                    {neighborhoods.map(n => (
                      <option key={n.id} value={n.id}>{n.name}</option>
                    ))}
                  </select>
                  <button onClick={() => handleAdd('buildings')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>
                    + Add Building
                  </button>
                </div>
              </div>
              
              <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: brand.bg }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Address</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Neighborhood</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Floor Plans</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuildings.map(b => (
                      <tr key={b.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                        <td style={{ padding: '16px' }}>
                          {editingId === `building-${b.id}` ? (
                            <input
                              style={inputStyle}
                              value={editValue.name || ''}
                              onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                            />
                          ) : (
                            <span style={{ fontWeight: 500, color: brand.text }}>{b.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {editingId === `building-${b.id}` ? (
                            <input
                              style={inputStyle}
                              value={editValue.address || ''}
                              onChange={(e) => setEditValue({ ...editValue, address: e.target.value })}
                            />
                          ) : (
                            <span style={{ color: brand.textLight }}>{b.address}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {editingId === `building-${b.id}` ? (
                            <select
                              style={inputStyle}
                              value={editValue.neighborhoodId || ''}
                              onChange={(e) => setEditValue({ ...editValue, neighborhoodId: Number(e.target.value) })}
                            >
                              {neighborhoods.map(n => (
                                <option key={n.id} value={n.id}>{n.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ color: brand.textLight }}>{neighborhoods.find(n => n.id === b.neighborhoodId)?.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px', color: brand.textLight }}>
                          {floorPlans.filter(f => f.buildingId === b.id).length} plans
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {editingId === `building-${b.id}` ? (
                            <button onClick={() => handleSave('buildings', b.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                          ) : (
                            <button onClick={() => { setEditingId(`building-${b.id}`); setEditValue({ name: b.name, address: b.address, neighborhoodId: b.neighborhoodId }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                          )}
                          <button onClick={() => handleDelete('buildings', b.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FLOOR PLANS TAB */}
          {activeTab === 'floorplans' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Floor Plans</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                  <select
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    style={{ ...inputStyle, width: 200 }}
                  >
                    <option value="">All Buildings</option>
                    {buildings.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                  <button onClick={() => handleAdd('floorplans')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>
                    + Add Floor Plan
                  </button>
                </div>
              </div>
              
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
                            <input
                              style={inputStyle}
                              value={editValue.name || ''}
                              onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                            />
                          ) : (
                            <span style={{ fontWeight: 500, color: brand.text }}>{f.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {editingId === `floorplan-${f.id}` ? (
                            <select
                              style={inputStyle}
                              value={editValue.buildingId || ''}
                              onChange={(e) => setEditValue({ ...editValue, buildingId: Number(e.target.value) })}
                            >
                              {buildings.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ color: brand.textLight }}>{buildings.find(b => b.id === f.buildingId)?.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {editingId === `floorplan-${f.id}` ? (
                            <input
                              style={{ ...inputStyle, width: 100 }}
                              type="number"
                              value={editValue.price || 0}
                              onChange={(e) => setEditValue({ ...editValue, price: Number(e.target.value) })}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: brand.text }}>${f.price}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {editingId === `floorplan-${f.id}` ? (
                            <button onClick={() => handleSave('floorplans', f.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                          ) : (
                            <button onClick={() => { setEditingId(`floorplan-${f.id}`); setEditValue({ name: f.name, price: f.price, buildingId: f.buildingId }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                          )}
                          <button onClick={() => handleDelete('floorplans', f.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADD-ONS TAB */}
          {activeTab === 'addons' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Add-Ons</h1>
                <button onClick={() => handleAdd('addons')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>
                  + Add Add-On
                </button>
              </div>
              
              <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: brand.bg }}>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Name</th>
                      <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Price</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {addOns.map(a => (
                      <tr key={a.id} style={{ borderTop: `1px solid ${brand.border}` }}>
                        <td style={{ padding: '16px' }}>
                          {editingId === `addon-${a.id}` ? (
                            <input
                              style={inputStyle}
                              value={editValue.name || ''}
                              onChange={(e) => setEditValue({ ...editValue, name: e.target.value })}
                            />
                          ) : (
                            <span style={{ fontWeight: 500, color: brand.text }}>{a.name}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px' }}>
                          {editingId === `addon-${a.id}` ? (
                            <input
                              style={{ ...inputStyle, width: 100 }}
                              type="number"
                              value={editValue.price || 0}
                              onChange={(e) => setEditValue({ ...editValue, price: Number(e.target.value) })}
                            />
                          ) : (
                            <span style={{ fontWeight: 600, color: brand.text }}>${a.price}</span>
                          )}
                        </td>
                        <td style={{ padding: '16px', textAlign: 'right' }}>
                          {editingId === `addon-${a.id}` ? (
                            <button onClick={() => handleSave('addons', a.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, marginRight: 8 }}>Save</button>
                          ) : (
                            <button onClick={() => { setEditingId(`addon-${a.id}`); setEditValue({ name: a.name, price: a.price }); }} style={{ ...buttonStyle, background: brand.bg, color: brand.text, marginRight: 8 }}>Edit</button>
                          )}
                          <button onClick={() => handleDelete('addons', a.id)} style={{ ...buttonStyle, background: '#fee2e2', color: brand.danger }}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
}
