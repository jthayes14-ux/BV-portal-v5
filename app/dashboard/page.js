'use client';
import React, { useState } from 'react';
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

// Sample bookings - will come from Supabase
const sampleBookings = [
  {
    id: 1,
    building: 'Brickell Heights',
    unit: '2405',
    floorPlan: '2 Bed / 2 Bath',
    date: '2026-02-15',
    time: '11:00 AM – 2:00 PM',
    price: 339,
    addOns: ['Balcony Glass'],
    addOnsPrice: 49,
    status: 'upcoming'
  },
  {
    id: 2,
    building: 'Brickell Heights',
    unit: '2405',
    floorPlan: '2 Bed / 2 Bath',
    date: '2026-01-10',
    time: '2:00 PM – 5:00 PM',
    price: 339,
    addOns: [],
    addOnsPrice: 0,
    status: 'completed'
  },
  {
    id: 3,
    building: 'Brickell Heights',
    unit: '2405',
    floorPlan: '2 Bed / 2 Bath',
    date: '2025-12-05',
    time: '11:00 AM – 2:00 PM',
    price: 339,
    addOns: ['Mirror Cleaning', 'Track Deep Clean'],
    addOnsPrice: 68,
    status: 'completed'
  },
];

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const brand = {
    primary: '#B8C5F2',
    text: '#1a1a1a',
    textLight: '#666',
    border: '#e0e0e0',
    bg: '#fafafa',
    success: '#22c55e',
  };

  const upcomingBookings = sampleBookings.filter(b => b.status === 'upcoming');
  const pastBookings = sampleBookings.filter(b => b.status === 'completed');
  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontSize: 22, fontWeight: 600, color: brand.text }}>BetterView</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button style={{
            padding: '10px 20px',
            fontSize: 14,
            fontWeight: 500,
            background: brand.primary,
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            color: brand.text,
            textDecoration: 'none'
          }}>
            <Link href="/book" style={{ color: brand.text, textDecoration: 'none' }}>Book a Cleaning</Link>
          </button>
          <div style={{ 
            width: 36, 
            height: 36, 
            background: brand.primary, 
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
            color: brand.text,
            cursor: 'pointer'
          }}>
            J
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ 
        maxWidth: 700,
        margin: '0 auto',
        padding: '48px 24px'
      }}>
        <h1 style={{ 
          fontSize: 28, 
          fontWeight: 600, 
          color: brand.text,
          marginBottom: 32
        }}>
          My Bookings
        </h1>

        {/* Tabs */}
        <div style={{ 
          display: 'flex',
          gap: 0,
          marginBottom: 32,
          borderBottom: `1px solid ${brand.border}`
        }}>
          <button
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'upcoming' ? `2px solid ${brand.text}` : '2px solid transparent',
              color: activeTab === 'upcoming' ? brand.text : brand.textLight,
              cursor: 'pointer',
              marginBottom: -1
            }}
          >
            Upcoming ({upcomingBookings.length})
          </button>
          <button
            onClick={() => setActiveTab('past')}
            style={{
              padding: '12px 24px',
              fontSize: 15,
              fontWeight: 500,
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'past' ? `2px solid ${brand.text}` : '2px solid transparent',
              color: activeTab === 'past' ? brand.text : brand.textLight,
              cursor: 'pointer',
              marginBottom: -1
            }}
          >
            Past ({pastBookings.length})
          </button>
        </div>

        {/* Bookings List */}
        {displayedBookings.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px 24px',
            background: 'white',
            borderRadius: 12,
            border: `1px solid ${brand.border}`
          }}>
            <p style={{ color: brand.textLight, marginBottom: 24 }}>
              {activeTab === 'upcoming' 
                ? "No upcoming bookings" 
                : "No past bookings"}
            </p>
            {activeTab === 'upcoming' && (
              <button style={{
                padding: '12px 24px',
                fontSize: 15,
                fontWeight: 500,
                background: brand.primary,
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                color: brand.text
              }}>
                Book a Cleaning
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {displayedBookings.map(booking => (
              <div 
                key={booking.id}
                style={{ 
                  background: 'white',
                  borderRadius: 12,
                  border: `1px solid ${brand.border}`,
                  overflow: 'hidden'
                }}
              >
                {/* Booking Header */}
                <div style={{ 
                  padding: '20px 24px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}>
                  <div>
                    <h3 style={{ 
                      fontSize: 18, 
                      fontWeight: 600, 
                      color: brand.text,
                      marginBottom: 4
                    }}>
                      {booking.building}
                    </h3>
                    <p style={{ fontSize: 14, color: brand.textLight }}>
                      Unit {booking.unit} · {booking.floorPlan}
                    </p>
                  </div>
                  <div style={{ 
                    padding: '6px 12px',
                    borderRadius: 100,
                    fontSize: 13,
                    fontWeight: 500,
                    background: booking.status === 'upcoming' ? brand.primary : '#e8e8e8',
                    color: brand.text
                  }}>
                    {booking.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                  </div>
                </div>

                {/* Booking Details */}
                <div style={{ 
                  padding: '16px 24px',
                  background: brand.bg,
                  borderTop: `1px solid ${brand.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 500, color: brand.text }}>
                      {formatDate(booking.date)}
                    </p>
                    <p style={{ fontSize: 14, color: brand.textLight }}>
                      {booking.time}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: brand.text }}>
                      ${booking.price + booking.addOnsPrice}
                    </p>
                    {booking.addOns.length > 0 && (
                      <p style={{ fontSize: 13, color: brand.textLight }}>
                        +{booking.addOns.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {booking.status === 'upcoming' && (
                  <div style={{ 
                    padding: '16px 24px',
                    borderTop: `1px solid ${brand.border}`,
                    display: 'flex',
                    gap: 12
                  }}>
                    <button style={{
                      padding: '10px 20px',
                      fontSize: 14,
                      fontWeight: 500,
                      background: 'white',
                      border: `1px solid ${brand.border}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: brand.text
                    }}>
                      Reschedule
                    </button>
                    <button style={{
                      padding: '10px 20px',
                      fontSize: 14,
                      fontWeight: 500,
                      background: 'white',
                      border: `1px solid ${brand.border}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: '#dc2626'
                    }}>
                      Cancel
                    </button>
                  </div>
                )}

                {booking.status === 'completed' && (
                  <div style={{ 
                    padding: '16px 24px',
                    borderTop: `1px solid ${brand.border}`,
                    display: 'flex',
                    gap: 12
                  }}>
                    <button style={{
                      padding: '10px 20px',
                      fontSize: 14,
                      fontWeight: 500,
                      background: brand.primary,
                      border: 'none',
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: brand.text
                    }}>
                      Book Again
                    </button>
                    <button style={{
                      padding: '10px 20px',
                      fontSize: 14,
                      fontWeight: 500,
                      background: 'white',
                      border: `1px solid ${brand.border}`,
                      borderRadius: 6,
                      cursor: 'pointer',
                      color: brand.text
                    }}>
                      View Receipt
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
