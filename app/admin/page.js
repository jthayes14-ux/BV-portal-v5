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
  const [dataLoading, setDataLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState({});
  const [selectedNeighborhood, setSelectedNeighborhood] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brand = {
    primary: '#B8C5F2', text: '#1a1a1a', textLight: '#666',
    border: '#e0e0e0', bg: '#fafafa', white: '#ffffff',
    danger: '#dc2626', success: '#22c55e', gold: '#C9B037',
  };

  const tabs = [
    { id: 'bookings', label: 'Bookings' },
    { id: 'frequencies', label: 'Frequencies' },
    { id: 'neighborhoods', label: 'Neighborhoods' },
    { id: 'buildings', label: 'Buildings' },
    { id: 'floorplans', label: 'Floor Plans' },
    { id: 'addons', label: 'Add-Ons' },
    { id: 'workers', label: 'Workers' },
  ];

  const buttonStyle = { padding: '8px 16px', fontSize: 14, fontWeight: 500, border: 'none', borderRadius: 6, cursor: 'pointer' };
  const inputStyle = { padding: '10px 12px', fontSize: 14, border: `1px solid ${brand.border}`, borderRadius: 6, width: '100%', boxSizing: 'border-box' };

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return; }
    if (!authLoading && user && !ADMIN_EMAILS.includes(user.email?.toLowerCase())) { router.push('/dashboard'); return; }
    if (!authLoading && user) loadAll();
  }, [authLoading, user]);

  const loadAll = async () => {
    const [nRes, bRes, fpRes, aoRes, bkRes, wRes, fqRes] = await Promise.all([
      supabase.from('neighborhoods').select('*').order('name'),
      supabase.from('buildings').select('*').order('name'),
      supabase.from('floor_plans').select('*').order('name'),
      supabase.from('add_ons').select('*').order('name'),
      supabase.from('bookings').select('*').order('booking_date', { ascending: false }),
      supabase.from('workers').select('*').order('name'),
      supabase.from('frequencies').select('*').order('sort_order'),
    ]);
    setNeighborhoods(nRes.data || []);
    setBuildings(bRes.data || []);
    setFloorPlans(fpRes.data || []);
    setAddOns(aoRes.data || []);
    setBookings(bkRes.data || []);
    setWorkers(wRes.data || []);
    setFrequencies(fqRes.data || []);
    setDataLoading(false);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Generic CRUD
  const handleAdd = async (type) => {
    let result;
    switch (type) {
      case 'neighborhoods':
        result = await supabase.from('neighborhoods').insert({ name: 'New Neighborhood' }).select().single();
        if (result.data) { setNeighborhoods([...neighborhoods, result.data]); setEditingId(`neighborhood-${result.data.id}`); setEditValue({ name: 'New Neighborhood' }); }
        break;
      case 'buildings':
        result = await supabase.from('buildings').insert({ name: 'New Building', address: '', neighborhood_id: neighborhoods[0]?.id }).select().single();
        if (result.data) { setBuildings([...buildings, result.data]); setEditingId(`building-${result.data.id}`); setEditValue({ name: 'New Building', address: '', neighborhood_id: neighborhoods[0]?.id }); }
        break;
      case 'floorplans':
        result = await supabase.from('floor_plans').insert({ name: 'New Floor Plan', price: 0, building_id: buildings[0]?.id }).select().single();
        if (result.data) { setFloorPlans([...floorPlans, result.data]); setEditingId(`floorplan-${result.data.id}`); setEditValue({ name: 'New Floor Plan', price: 0, building_id: buildings[0]?.id }); }
        break;
      case 'addons':
        result = await supabase.from('add_ons').insert({ name: 'New Add-On', price: 0 }).select().single();
        if (result.data) { setAddOns([...addOns, result.data]); setEditingId(`addon-${result.data.id}`); setEditValue({ name: 'New Add-On', price: 0 }); }
        break;
      case 'workers':
        result = await supabase.from('workers').insert({ name: 'New Worker', email: '', phone: '' }).select().single();
        if (result.data) { setWorkers([...workers, result.data]); setEditingId(`worker-${result.data.id}`); setEditValue({ name: 'New Worker', email: '', phone: '' }); }
        break;
      case 'frequencies':
        const maxSort = frequencies.reduce((max, f) => Math.max(max, f.sort_order || 0), 0);
        result = await supabase.from('frequencies').insert({ name: 'New Frequency', discount_percent: 0, interval_days: 0, sort_order: maxSort + 1 }).select().single();
        if (result.data) { setFrequencies([...frequencies, result.data]); setEditingId(`frequency-${result.data.id}`); setEditValue({ name: 'New Frequency', discount_percent: 0, interval_days: 0, sort_order: maxSort + 1 }); }
        break;
    }
  };

  const handleSave = async (type, id) => {
    switch (type) {
      case 'neighborhoods':
        await supabase.from('neighborhoods').update({ name: editValue.name }).eq('id', id);
        setNeighborhoods(neighborhoods.map(n => n.id === id ? { ...n, ...editValue } : n));
        break;
      case 'buildings':
        await supabase.from('buildings').update(editValue).eq('id', id);
        setBuildings(buildings.map(b => b.id === id ? { ...b, ...editValue } : b));
        break;
      case 'floorplans':
        await supabase.from('floor_plans').update(editValue).eq('id', id);
        setFloorPlans(floorPlans.map(f => f.id === id ? { ...f, ...editValue } : f));
        break;
      case 'addons':
        await supabase.from('add_ons').update(editValue).eq('id', id);
        setAddOns(addOns.map(a => a.id === id ? { ...a, ...editValue } : a));
        break;
      case 'workers':
        await supabase.from('workers').update(editValue).eq('id', id);
        setWorkers(workers.map(w => w.id === id ? { ...w, ...editValue } : w));
        break;
      case 'frequencies':
        await supabase.from('frequencies').update(editValue).eq('id', id);
        setFrequencies(frequencies.map(f => f.id === id ? { ...f, ...editValue } : f));
        break;
    }
    setEditingId(null);
    setEditValue({});
  };

  const handleDelete = async (type, id) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    const tableMap = { neighborhoods: 'neighborhoods', buildings: 'buildings', floorplans: 'floor_plans', addons: 'add_ons', workers: 'workers', frequencies: 'frequencies' };
    await supabase.from(tableMap[type]).delete().eq('id', id);
    switch (type) {
      case 'neighborhoods': setNeighborhoods(neighborhoods.filter(n => n.id !== id)); break;
      case 'buildings': setBuildings(buildings.filter(b => b.id !== id)); break;
      case 'floorplans': setFloorPlans(floorPlans.filter(f => f.id !== id)); break;
      case 'addons': setAddOns(addOns.filter(a => a.id !== id)); break;
      case 'workers': setWorkers(workers.filter(w => w.id !== id)); break;
      case 'frequencies': setFrequencies(frequencies.filter(f => f.id !== id)); break;
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

  const getFrequencyName = (frequencyId) => {
    return frequencies.find(f => f.id === frequencyId)?.name || '';
  };

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

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Bookings</h1>
              </div>
              <div className="table-wrapper">
                <div style={{ background: brand.white, borderRadius: 8, border: `1px solid ${brand.border}`, overflow: 'hidden', minWidth: 800 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: brand.bg }}>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Customer</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Property</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Date & Time</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Total</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Status</th>
                        <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Worker</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: brand.textLight }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => {
                        const freqName = getFrequencyName(booking.frequency_id);
                        const statusStyle = getStatusStyle(booking.status);
                        const isRecurring = !!booking.recurring_group_id;
                        const isActionable = booking.status === 'upcoming' || booking.status === 'scheduled';

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
                                  <button onClick={() => handleMarkComplete(booking.id)} style={{ ...buttonStyle, background: brand.success, color: brand.white, fontSize: 12, padding: '6px 12px' }}>
                                    Complete
                                  </button>
                                )}
                                {isActionable && isRecurring && (
                                  <>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>Add-Ons</h1>
                <button onClick={() => handleAdd('addons')} style={{ ...buttonStyle, background: brand.text, color: brand.white }}>+ Add Add-On</button>
              </div>
              <div className="table-wrapper">
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

        </main>
      </div>
    </div>
  );
}
