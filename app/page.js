'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

function Logo({ size = 'normal' }) {
  const isLarge = size === 'large';
  return (
    <div style={{ display: 'flex', gap: isLarge ? 8 : 4 }}>
      <div style={{
        width: isLarge ? 20 : 8,
        height: isLarge ? 56 : 28,
        background: '#B8C5F2',
        borderRadius: 0
      }} />
      <div style={{
        width: isLarge ? 20 : 8,
        height: isLarge ? 56 : 28,
        background: '#B8C5F2',
        borderRadius: 0
      }} />
      <div style={{
        width: isLarge ? 20 : 8,
        height: isLarge ? 56 : 28,
        background: '#B8C5F2',
        borderRadius: 0
      }} />
    </div>
  );
}

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid #E8EDFC',
      padding: '20px 0'
    }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 600, color: '#2D3748' }}>{question}</span>
        <span style={{ fontSize: 24, color: '#B8C5F2' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <p style={{
          marginTop: 12,
          fontSize: 16,
          color: '#718096',
          lineHeight: 1.6
        }}>
          {answer}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const heroButtonRef = useRef(null);

  useEffect(() => {
    const el = heroButtonRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const brand = {
    primary: '#B8C5F2',
    primaryDark: '#9AA8E0',
    primaryLight: '#E8EDFC',
    text: '#2D3748',
    textLight: '#718096',
    bg: '#FFFFFF',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: brand.bg,
      fontFamily: "'Cormorant Garamond', Georgia, serif"
    }}>
      {/* Header */}
      <header className="landing-header" style={{
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        borderBottom: `1px solid ${brand.primaryLight}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
        </div>

        <div className="desktop-nav" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/login" style={{
            padding: '10px 24px',
            fontSize: 15,
            fontWeight: 500,
            background: 'transparent',
            border: 'none',
            color: brand.textLight,
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            Log in
          </Link>
          <Link href="/book" style={{
            padding: '11px 26px',
            fontSize: 14,
            fontWeight: 600,
            background: '#1B2B5A',
            border: 'none',
            borderRadius: 9999,
            color: '#FFFFFF',
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            See Your Price Instantly
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
          <Link href="/book" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '14px 16px', fontSize: 16, fontWeight: 600,
            background: '#B8C5F2', color: '#2D3748', textDecoration: 'none',
            textAlign: 'center', borderRadius: 9999
          }}>
            Book Now
          </Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '14px 16px', fontSize: 16, fontWeight: 500,
            color: brand.textLight, textDecoration: 'none', textAlign: 'center',
            borderRadius: 8
          }}>
            Log in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 40px',
        minHeight: 'calc(100vh - 69px)',
        alignItems: 'center',
        gap: 40
      }}>
        {/* Left Column - Text */}
        <div className="hero-text" style={{
          padding: '60px 40px 60px 0',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 22
          }}>
            <div style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#9AA8E0'
            }} />
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: '#9AA8E0'
            }}>
              Miami&#39;s Luxury High-Rise Window Service
            </span>
          </div>

          <h1 style={{
            fontSize: 60,
            fontWeight: 300,
            color: brand.text,
            lineHeight: 1.06,
            marginBottom: 22,
            letterSpacing: '-0.01em'
          }}>
            Crystal clear views, one tap away.
          </h1>

          <p style={{
            fontSize: 16,
            color: brand.textLight,
            lineHeight: 1.65,
            marginBottom: 32,
            maxWidth: 400
          }}>
            Enter your unit number. See your exact price in seconds — no quote requests, no callbacks, no waiting. Book your Brickell or Edgewater condo in under a minute.
          </p>

          {/* Stats Row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginBottom: 32
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1B2B5A' }}>60s</span>
              <span style={{ fontSize: 10, color: brand.textLight, fontWeight: 500 }}>To book</span>
            </div>
            <div style={{ width: 1, height: 32, background: brand.primaryLight }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1B2B5A' }}>$0</span>
              <span style={{ fontSize: 10, color: brand.textLight, fontWeight: 500 }}>Upfront charge</span>
            </div>
            <div style={{ width: 1, height: 32, background: brand.primaryLight }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1B2B5A' }}>24hr</span>
              <span style={{ fontSize: 10, color: brand.textLight, fontWeight: 500 }}>Free cancellation</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div ref={heroButtonRef} className="hero-buttons" style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 18 }}>
            <Link href="/book" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 9,
              padding: '17px 34px',
              background: '#1B2B5A',
              color: '#FFFFFF',
              borderRadius: 9999,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.02em',
              border: 'none',
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(27,43,90,0.28)',
              transition: 'all 0.3s ease'
            }}>
              See Your Price Instantly
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <a href="#how-it-works" style={{
              fontSize: 13,
              fontWeight: 500,
              color: brand.textLight,
              textDecoration: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 5
            }}>
              How it works
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>
          </div>

          {/* Trust Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 11,
            color: '#9CA3AF'
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Insured &amp; bonded · Card charged only after service completion</span>
          </div>
        </div>

        {/* Right Column - Phone Mockup */}
        <div className="hero-phone" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '60px 0 60px 20px',
          position: 'relative'
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            width: 400,
            height: 480,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(184,197,242,0.2) 0%, transparent 70%)',
            pointerEvents: 'none'
          }} />

          {/* Phone Frame */}
          <div className="hero-phone-frame" style={{
            width: 272,
            height: 548,
            background: '#fff',
            borderRadius: 38,
            position: 'relative',
            flexShrink: 0,
            boxShadow: '0 0 0 1.5px rgba(184,197,242,0.3), 0 0 0 9px #111827, 0 0 0 11px #1e2a3a, 0 40px 80px rgba(0,0,0,0.32), 0 14px 36px rgba(27,43,90,0.18)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Notch */}
            <div style={{
              position: 'absolute',
              top: 10,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 76,
              height: 22,
              background: '#111827',
              borderRadius: 16,
              zIndex: 50
            }} />

            {/* Phone Header */}
            <div style={{
              height: 50,
              background: '#fff',
              borderBottom: '1px solid #E8EDFC',
              display: 'flex',
              alignItems: 'flex-end',
              padding: '0 14px 9px'
            }}>
              <div style={{ display: 'flex', gap: 2.5, marginRight: 6 }}>
                <div style={{ width: 3, height: 15, background: brand.primary }} />
                <div style={{ width: 3, height: 15, background: brand.primary }} />
                <div style={{ width: 3, height: 15, background: brand.primary }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: brand.text }}>BetterView</span>
            </div>

            {/* Phone Body */}
            <div style={{
              padding: '14px 13px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              background: '#FAFBFF',
              flex: 1,
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
            }}>
              <h3 style={{
                fontSize: 19,
                fontWeight: 300,
                textAlign: 'center',
                lineHeight: 1.2,
                marginTop: 4,
                color: brand.text,
                fontFamily: "'Cormorant Garamond', Georgia, serif"
              }}>
                Schedule Your<br />Service
              </h3>
              <p style={{ fontSize: 9, color: brand.textLight, textAlign: 'center' }}>
                Premium window care for luxury residences
              </p>

              {/* Brickell - done */}
              <div style={{
                background: 'rgba(184,197,242,0.07)',
                border: '1.5px solid #B8C5F2',
                borderRadius: 9,
                padding: '9px 11px',
                fontSize: 10.5,
                fontWeight: 600,
                color: '#1B2B5A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                Brickell
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1B2B5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* 1010 Brickell - done */}
              <div style={{
                background: 'rgba(184,197,242,0.07)',
                border: '1.5px solid #B8C5F2',
                borderRadius: 9,
                padding: '9px 11px',
                fontSize: 10.5,
                fontWeight: 600,
                color: '#1B2B5A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                1010 Brickell
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1B2B5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* Unit - active */}
              <div style={{
                background: '#fff',
                border: '1.5px solid #1B2B5A',
                borderRadius: 9,
                padding: '9px 11px',
                fontSize: 10.5,
                fontWeight: 600,
                color: '#1B2B5A',
                boxShadow: '0 0 0 3px rgba(27,43,90,0.08)',
                display: 'flex',
                alignItems: 'center'
              }}>
                3207
                <span style={{ display: 'inline-block', width: 1.5, height: 12, background: '#1B2B5A', marginLeft: 1, verticalAlign: 'text-bottom' }} />
              </div>

              {/* Price reveal */}
              <div style={{
                background: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: 9,
                padding: '9px 11px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 10.5,
                fontWeight: 600,
                color: '#15803D'
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Unit 3207 — 2BR/2BA — <strong style={{ marginLeft: 3 }}>$189</strong>
              </div>

              {/* Date - done */}
              <div style={{
                background: 'rgba(184,197,242,0.07)',
                border: '1.5px solid #B8C5F2',
                borderRadius: 9,
                padding: '9px 11px',
                fontSize: 10,
                fontWeight: 600,
                color: '#1B2B5A',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                Thu, Apr 3 · 10:00 AM
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1B2B5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              {/* Book button */}
              <button style={{
                width: '100%',
                padding: 11,
                background: '#1B2B5A',
                color: '#fff',
                border: 'none',
                borderRadius: 9,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 14px rgba(27,43,90,0.28)',
                cursor: 'default'
              }}>
                Book Now — $189
              </button>

              <p style={{ fontSize: 8.5, color: '#9CA3AF', textAlign: 'center' }}>
                Charged after service · Free 24hr cancellation
              </p>
            </div>
          </div>

          {/* Floating badge - Unit matched (top right) */}
          <div className="hero-float-notification" style={{
            position: 'absolute',
            right: -14,
            top: 76,
            background: '#fff',
            borderRadius: 11,
            padding: '9px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 6px 20px rgba(0,0,0,0.11), 0 0 0 1px rgba(232,237,252,0.9)',
            whiteSpace: 'nowrap',
            zIndex: 20,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: '#F0FDF4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1B2B5A', lineHeight: 1.25 }}>Unit found</div>
              <div style={{ fontSize: 8.5, color: brand.textLight }}>1010 Brickell · $189</div>
            </div>
          </div>

          {/* Floating badge - Booked (bottom left) */}
          <div className="hero-float-booking" style={{
            position: 'absolute',
            left: 0,
            bottom: 108,
            background: '#fff',
            borderRadius: 11,
            padding: '9px 13px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 6px 20px rgba(0,0,0,0.11), 0 0 0 1px rgba(232,237,252,0.9)',
            whiteSpace: 'nowrap',
            zIndex: 20,
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: 7,
              background: '#EEF1FC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1B2B5A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#1B2B5A', lineHeight: 1.25 }}>Booked for Apr 3</div>
              <div style={{ fontSize: 8.5, color: brand.textLight }}>1010 Brickell · 10:00 AM</div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section style={{
        padding: '80px 24px',
        background: 'white'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 className="section-heading" style={{
            fontSize: 36,
            fontWeight: 600,
            color: brand.text,
            marginBottom: 16
          }}>
            What We Do
          </h2>
          <p style={{
            fontSize: 18,
            color: brand.textLight,
            marginBottom: 48,
            maxWidth: 600,
            margin: '0 auto 48px'
          }}>
            We specialize in professional window cleaning for luxury high-rise condominiums throughout Miami.
          </p>

          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 32
          }}>
            <div style={{ padding: 24 }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#1B2B5A',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="1" />
                  <line x1="8" y1="6" x2="10" y2="6" />
                  <line x1="14" y1="6" x2="16" y2="6" />
                  <line x1="8" y1="10" x2="10" y2="10" />
                  <line x1="14" y1="10" x2="16" y2="10" />
                  <line x1="8" y1="14" x2="10" y2="14" />
                  <line x1="14" y1="14" x2="16" y2="14" />
                  <line x1="10" y1="18" x2="14" y2="18" />
                  <line x1="10" y1="18" x2="10" y2="22" />
                  <line x1="14" y1="18" x2="14" y2="22" />
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: brand.text, marginBottom: 8 }}>
                High-Rise Experts
              </h3>
              <p style={{ fontSize: 16, color: brand.textLight, lineHeight: 1.6 }}>
                We know Miami's luxury buildings inside and out. From Brickell to Edgewater, we've got you covered.
              </p>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#1B2B5A',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L13.5 8.5L20 7L15 12L20 17L13.5 15.5L12 22L10.5 15.5L4 17L9 12L4 7L10.5 8.5L12 2Z" />
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: brand.text, marginBottom: 8 }}>
                Spotless Results
              </h3>
              <p style={{ fontSize: 16, color: brand.textLight, lineHeight: 1.6 }}>
                Professional-grade equipment and eco-friendly solutions for streak-free, crystal clear windows.
              </p>
            </div>

            <div style={{ padding: 24 }}>
              <div style={{
                width: 64,
                height: 64,
                background: '#1B2B5A',
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: brand.text, marginBottom: 8 }}>
                Fully Insured
              </h3>
              <p style={{ fontSize: 16, color: brand.textLight, lineHeight: 1.6 }}>
                Licensed, bonded, and insured. Your home is protected while we work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{
        padding: '80px 24px',
        background: brand.bg,
        scrollMarginTop: 80
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 className="section-heading" style={{
            fontSize: 36,
            fontWeight: 600,
            color: brand.text,
            marginBottom: 16,
            textAlign: 'center'
          }}>
            How It Works
          </h2>
          <p style={{
            fontSize: 18,
            color: brand.textLight,
            marginBottom: 48,
            textAlign: 'center'
          }}>
            No account required. Book your window cleaning in 60 seconds.
          </p>

          <div className="steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 24
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48,
                height: 48,
                background: brand.primary,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 20,
                fontWeight: 600,
                color: brand.text
              }}>
                1
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 8 }}>
                Select Building
              </h3>
              <p style={{ fontSize: 16, color: brand.textLight, lineHeight: 1.5 }}>
                Choose your building and floor plan from our list
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48,
                height: 48,
                background: brand.primary,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 20,
                fontWeight: 600,
                color: brand.text
              }}>
                2
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 8 }}>
                See Your Price
              </h3>
              <p style={{ fontSize: 16, color: brand.textLight, lineHeight: 1.5 }}>
                Get instant pricing based on your unit - no surprises
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48,
                height: 48,
                background: brand.primary,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 20,
                fontWeight: 600,
                color: brand.text
              }}>
                3
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 8 }}>
                Pick a Time
              </h3>
              <p style={{ fontSize: 16, color: brand.textLight, lineHeight: 1.5 }}>
                Choose a date and time that works for you
              </p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 48,
                height: 48,
                background: brand.primary,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: 20,
                fontWeight: 600,
                color: brand.text
              }}>
                4
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 8 }}>
                We Handle the Rest
              </h3>
              <p style={{ fontSize: 16, color: brand.textLight, lineHeight: 1.5 }}>
                Our pros arrive on time and leave your windows sparkling
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link href="/book" style={{
              padding: '18px 48px',
              fontSize: 18,
              fontWeight: 600,
              background: '#B8C5F2',
              border: 'none',
              borderRadius: 9999,
              color: brand.text,
              cursor: 'pointer',
              textDecoration: 'none',
              display: 'inline-block',
              letterSpacing: '0.02em',
              transition: 'all 0.3s ease'
            }}>
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{
        padding: '80px 24px',
        background: 'white'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 className="section-heading" style={{
            fontSize: 36,
            fontWeight: 600,
            color: brand.text,
            marginBottom: 40,
            textAlign: 'center'
          }}>
            Frequently Asked Questions
          </h2>

          <FAQItem
            question="How long does a cleaning take?"
            answer="Most units take 1 to 2 hours depending on the number of windows and their condition. We'll give you a more accurate estimate when you book based on your floor plan."
          />
          <FAQItem
            question="Do I need to be home?"
            answer="You don't need to be home, but someone needs to let us in. Many of our clients leave a key with the front desk or have their building management grant us access."
          />
          <FAQItem
            question="What's included in the cleaning?"
            answer="We clean all interior and exterior balcony glass. Including your window, doors and railing glass."
          />
          <FAQItem
            question="How do you access my building?"
            answer="We're familiar with most luxury buildings in Miami and their access procedures. We coordinate with building management and follow all security protocols."
          />
          <FAQItem
            question="When am I charged?"
            answer="Your card is saved when you book but you're only charged after the cleaning is complete. Free cancellation up to 24 hours before your appointment."
          />
          <FAQItem
            question="Do you clean balcony windows?"
            answer="Yes! That is our specialty."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section" style={{
        padding: '80px 24px',
        background: 'linear-gradient(135deg, #2D3748 0%, #1a202c 100%)',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: 36,
          fontWeight: 600,
          color: '#FFFFFF',
          marginBottom: 16
        }}>
          Ready for crystal clear views?
        </h2>
        <p style={{
          fontSize: 18,
          color: 'rgba(255,255,255,0.7)',
          marginBottom: 40
        }}>
          No account needed. Book your cleaning in 60 seconds.
        </p>
        <Link href="/book" style={{
          padding: '20px 56px',
          fontSize: 20,
          fontWeight: 600,
          background: '#B8C5F2',
          border: 'none',
          borderRadius: 9999,
          color: '#2D3748',
          cursor: 'pointer',
          textDecoration: 'none',
          display: 'inline-block',
          letterSpacing: '0.02em',
          transition: 'all 0.3s ease'
        }}>
          Book Now
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '40px 24px',
        background: brand.text,
        color: 'white'
      }}>
        <div className="footer-content" style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo />
            <span style={{ fontSize: 20, fontWeight: 600 }}>BetterView</span>
          </div>

          <div className="footer-links" style={{ display: 'flex', gap: 32, fontSize: 14, opacity: 0.8 }}>
            <span>Miami, FL</span>
            <span>jack@betterviewwindowcleanings.com</span>
            <span>(954) 758-9829</span>
          </div>
        </div>

        <div style={{
          maxWidth: 900,
          margin: '24px auto 0',
          paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
          fontSize: 14,
          opacity: 0.6
        }}>
          &copy; 2025 BetterView Window Cleaning. All rights reserved.
        </div>
      </footer>

      {/* Sticky mobile Book Now bar */}
      <div className={`sticky-book-bar ${showStickyBar ? 'visible' : ''}`} style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: 'rgba(255, 255, 255, 0.97)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid #E5E7EB',
        zIndex: 999,
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.08)'
      }}>
        <Link href="/book" style={{
          display: 'block',
          width: '100%',
          padding: '16px',
          fontSize: 17,
          fontWeight: 600,
          background: '#B8C5F2',
          border: 'none',
          borderRadius: 9999,
          color: '#2D3748',
          cursor: 'pointer',
          textDecoration: 'none',
          textAlign: 'center',
          letterSpacing: '0.02em'
        }}>
          Book Now
        </Link>
      </div>
    </div>
  );
}
