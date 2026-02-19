'use client';
import React, { useState } from 'react';
import Link from 'next/link';

const font = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', system-ui, sans-serif";

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderBottom: '1px solid #E5E5E5',
      padding: '24px 0'
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
          textAlign: 'left',
          fontFamily: font
        }}
      >
        <span style={{ fontSize: 18, fontWeight: 600, color: '#111111', letterSpacing: '-0.01em' }}>{question}</span>
        <span style={{ fontSize: 20, color: '#111111', fontWeight: 300, marginLeft: 24, flexShrink: 0 }}>{open ? '\u2212' : '+'}</span>
      </button>
      {open && (
        <p style={{
          marginTop: 16,
          fontSize: 16,
          color: '#666666',
          lineHeight: 1.7,
          fontWeight: 400
        }}>
          {answer}
        </p>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      fontFamily: font
    }}>
      {/* Header */}
      <header className="landing-header" style={{
        padding: '20px 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <span style={{
            fontSize: 20,
            fontWeight: 600,
            color: '#111111',
            letterSpacing: '-0.02em'
          }}>
            BetterView
          </span>
        </Link>

        <div className="desktop-nav" style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
          <Link href="/login" style={{
            fontSize: 15,
            fontWeight: 400,
            color: '#666666',
            textDecoration: 'none'
          }}>
            Log in
          </Link>
          <Link href="/book" className="btn-primary" style={{
            padding: '10px 24px',
            fontSize: 15,
            fontWeight: 500,
            background: '#B8C5F2',
            border: 'none',
            borderRadius: 100,
            color: '#111111',
            textDecoration: 'none',
            letterSpacing: '-0.01em'
          }}>
            Book Now
          </Link>
        </div>

        <button className="mobile-nav-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
          {mobileMenuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#111111" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/>
            </svg>
          )}
        </button>

        <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <Link href="/book" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '14px 16px', fontSize: 16, fontWeight: 500,
            background: '#B8C5F2', color: '#111111', textDecoration: 'none',
            textAlign: 'center', borderRadius: 100
          }}>
            Book Now
          </Link>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '14px 16px', fontSize: 16, fontWeight: 400,
            color: '#666666', textDecoration: 'none', textAlign: 'center'
          }}>
            Log in
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" style={{
        padding: '120px 48px 160px',
        background: '#FFFFFF',
        maxWidth: 900,
        marginLeft: 48
      }}>
        <h1 className="hero-headline" style={{
          fontSize: 64,
          fontWeight: 700,
          color: '#111111',
          lineHeight: 1.05,
          letterSpacing: '-0.03em',
          marginBottom: 24
        }}>
          Crystal clear views,<br />
          one tap away.
        </h1>

        <p style={{
          fontSize: 20,
          color: '#666666',
          lineHeight: 1.5,
          fontWeight: 400,
          marginBottom: 48,
          maxWidth: 480
        }}>
          Professional window cleaning for Miami's finest high-rises.
        </p>

        <Link href="/book" className="btn-primary" style={{
          padding: '16px 40px',
          fontSize: 17,
          fontWeight: 500,
          background: '#B8C5F2',
          border: 'none',
          borderRadius: 100,
          color: '#111111',
          textDecoration: 'none',
          display: 'inline-block',
          letterSpacing: '-0.01em'
        }}>
          Book Now
        </Link>
      </section>

      {/* What We Do */}
      <section style={{
        padding: '120px 48px',
        background: '#FFFFFF',
        borderTop: '1px solid #F0F0F0'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 className="section-heading" style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#111111',
            marginBottom: 64,
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            What we do
          </h2>

          <div className="features-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 48
          }}>
            <div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 12,
                letterSpacing: '-0.01em'
              }}>
                High-rise experts
              </h3>
              <p style={{ fontSize: 16, color: '#666666', lineHeight: 1.7, fontWeight: 400 }}>
                We know Miami's luxury buildings inside and out. From Brickell to Edgewater, we've got you covered.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 12,
                letterSpacing: '-0.01em'
              }}>
                Spotless results
              </h3>
              <p style={{ fontSize: 16, color: '#666666', lineHeight: 1.7, fontWeight: 400 }}>
                Professional-grade equipment and eco-friendly solutions for streak-free, crystal clear windows.
              </p>
            </div>

            <div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 12,
                letterSpacing: '-0.01em'
              }}>
                Fully insured
              </h3>
              <p style={{ fontSize: 16, color: '#666666', lineHeight: 1.7, fontWeight: 400 }}>
                Licensed, bonded, and insured. Your home is protected while we work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{
        padding: '120px 48px',
        background: '#FFFFFF',
        borderTop: '1px solid #F0F0F0'
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <h2 className="section-heading" style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#111111',
            marginBottom: 64,
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            How it works
          </h2>

          <div className="steps-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 48
          }}>
            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#999999',
                marginBottom: 16,
                letterSpacing: '0.02em'
              }}>
                01
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 12,
                letterSpacing: '-0.01em'
              }}>
                Select building
              </h3>
              <p style={{ fontSize: 16, color: '#666666', lineHeight: 1.7, fontWeight: 400 }}>
                Choose your building and floor plan from our list.
              </p>
            </div>

            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#999999',
                marginBottom: 16,
                letterSpacing: '0.02em'
              }}>
                02
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 12,
                letterSpacing: '-0.01em'
              }}>
                See your price
              </h3>
              <p style={{ fontSize: 16, color: '#666666', lineHeight: 1.7, fontWeight: 400 }}>
                Get instant pricing based on your unit. No surprises.
              </p>
            </div>

            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#999999',
                marginBottom: 16,
                letterSpacing: '0.02em'
              }}>
                03
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 12,
                letterSpacing: '-0.01em'
              }}>
                Pick a time
              </h3>
              <p style={{ fontSize: 16, color: '#666666', lineHeight: 1.7, fontWeight: 400 }}>
                Choose a date and time that works for you.
              </p>
            </div>

            <div>
              <div style={{
                fontSize: 14,
                fontWeight: 500,
                color: '#999999',
                marginBottom: 16,
                letterSpacing: '0.02em'
              }}>
                04
              </div>
              <h3 style={{
                fontSize: 20,
                fontWeight: 600,
                color: '#111111',
                marginBottom: 12,
                letterSpacing: '-0.01em'
              }}>
                We handle the rest
              </h3>
              <p style={{ fontSize: 16, color: '#666666', lineHeight: 1.7, fontWeight: 400 }}>
                Our pros arrive on time and leave your windows sparkling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section style={{
        padding: '120px 48px',
        background: '#FFFFFF',
        borderTop: '1px solid #F0F0F0'
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 className="section-heading" style={{
            fontSize: 48,
            fontWeight: 700,
            color: '#111111',
            marginBottom: 64,
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Questions
          </h2>

          <FAQItem
            question="How long does a cleaning take?"
            answer="Most units take 30-60 minutes depending on the number of windows and their condition. We'll give you a more accurate estimate when you book based on your floor plan."
          />
          <FAQItem
            question="Do I need to be home?"
            answer="You don't need to be home, but someone needs to let us in. Many of our clients leave a key with the front desk or have their building management grant us access."
          />
          <FAQItem
            question="What's included in the cleaning?"
            answer="We clean all interior window surfaces, window sills, and tracks. We use professional-grade, eco-friendly cleaning solutions that leave no streaks or residue."
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
            answer="Yes. Interior balcony windows and doors are included. Exterior high-rise windows require specialized equipment — contact us for a custom quote."
          />
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '48px 48px',
        background: '#FFFFFF',
        borderTop: '1px solid #F0F0F0'
      }}>
        <div className="footer-content" style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{
            fontSize: 15,
            fontWeight: 500,
            color: '#111111',
            letterSpacing: '-0.01em'
          }}>
            BetterView
          </span>

          <div className="footer-links" style={{
            display: 'flex',
            gap: 32,
            fontSize: 14,
            color: '#999999',
            fontWeight: 400
          }}>
            <span>Miami, FL</span>
            <span>hello@betterview.com</span>
            <span>(305) 555-0123</span>
          </div>
        </div>

        <div style={{
          maxWidth: 960,
          margin: '32px auto 0',
          fontSize: 13,
          color: '#CCCCCC',
          fontWeight: 400
        }}>
          &copy; 2025 BetterView Window Cleaning
        </div>
      </footer>

      {/* Sticky mobile Book Now bar */}
      <div className="sticky-book-bar" style={{
        display: 'none',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        background: '#FFFFFF',
        borderTop: '1px solid #F0F0F0',
        zIndex: 999
      }}>
        <Link href="/book" style={{
          display: 'block',
          width: '100%',
          padding: '14px',
          fontSize: 16,
          fontWeight: 500,
          background: '#B8C5F2',
          border: 'none',
          borderRadius: 100,
          color: '#111111',
          textDecoration: 'none',
          textAlign: 'center',
          letterSpacing: '-0.01em'
        }}>
          Book Now
        </Link>
      </div>
    </div>
  );
}
