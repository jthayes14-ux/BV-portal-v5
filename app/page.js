'use client';
import React, { useState } from 'react';
import Link from 'next/link';

function Logo({ size = 'normal' }) {
  const isLarge = size === 'large';
  return (
    <div style={{ display: 'flex', gap: isLarge ? 8 : 4 }}>
      <div style={{ 
        width: isLarge ? 20 : 8, 
        height: isLarge ? 56 : 28, 
        background: '#B8C5F2', 
        borderRadius: 3 
      }} />
      <div style={{ 
        width: isLarge ? 20 : 8, 
        height: isLarge ? 56 : 28, 
        background: '#B8C5F2', 
        borderRadius: 3 
      }} />
      <div style={{ 
        width: isLarge ? 20 : 8, 
        height: isLarge ? 56 : 28, 
        background: '#B8C5F2', 
        borderRadius: 3 
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
  const brand = {
    primary: '#B8C5F2',
    primaryDark: '#9AA8E0',
    primaryLight: '#E8EDFC',
    text: '#2D3748',
    textLight: '#718096',
    bg: '#F8FAFF',
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: brand.bg,
      fontFamily: "'Cormorant Garamond', Georgia, serif"
    }}>
      {/* Header */}
      <header style={{ 
        padding: '20px 32px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: 'white',
        borderBottom: `1px solid ${brand.primaryLight}`,
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/login" style={{ 
            padding: '10px 24px', 
            fontSize: 16,
            fontWeight: 500,
            background: 'transparent', 
            border: 'none',
            color: brand.text,
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            Log in
          </Link>
          <Link href="/login" style={{ 
            padding: '10px 24px', 
            fontSize: 16,
            fontWeight: 500,
            background: brand.primary, 
            border: 'none',
            borderRadius: 8,
            color: brand.text,
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '90vh',
        padding: '60px 24px',
        textAlign: 'center',
        background: `linear-gradient(180deg, ${brand.bg} 0%, ${brand.primaryLight} 100%)`
      }}>
        <div style={{ marginBottom: 40 }}>
          <Logo size="large" />
        </div>
        
        <h1 style={{ 
          fontSize: 52, 
          fontWeight: 600, 
          color: brand.text,
          lineHeight: 1.2,
          marginBottom: 20,
          maxWidth: 600
        }}>
          Crystal clear views,
          <br />
          one tap away
        </h1>
        
        <p style={{ 
          fontSize: 20, 
          color: brand.textLight,
          lineHeight: 1.6,
          marginBottom: 40,
          maxWidth: 500
        }}>
          Professional window cleaning for Miami's finest high-rises.
          <br />
          Book instantly. No quotes. No waiting.
        </p>
        
        <div style={{ display: 'flex', gap: 16 }}>
          <Link href="/login" style={{ 
            padding: '16px 40px', 
            fontSize: 18,
            fontWeight: 600,
            background: brand.primary, 
            border: 'none',
            borderRadius: 10,
            color: brand.text,
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            Get Started
          </Link>
          <Link href="/login" style={{ 
            padding: '16px 40px', 
            fontSize: 18,
            fontWeight: 600,
            background: 'transparent', 
            border: `2px solid ${brand.primary}`,
            borderRadius: 10,
            color: brand.text,
            cursor: 'pointer',
            textDecoration: 'none'
          }}>
            Log In
          </Link>
        </div>
      </section>

      {/* What We Do */}
      <section style={{ 
        padding: '80px 24px',
        background: 'white'
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
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
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 32 
          }}>
            <div style={{ padding: 24 }}>
              <div style={{ 
                width: 64, 
                height: 64, 
                background: brand.primaryLight, 
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 28
              }}>
                🏢
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
                background: brand.primaryLight, 
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 28
              }}>
                ✨
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
                background: brand.primaryLight, 
                borderRadius: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: 28
              }}>
                🛡️
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
      <section style={{ 
        padding: '80px 24px',
        background: brand.bg
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <h2 style={{ 
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
            Book your window cleaning in 60 seconds
          </p>
          
          <div style={{ 
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
              <p style={{ fontSize: 14, color: brand.textLight, lineHeight: 1.5 }}>
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
              <p style={{ fontSize: 14, color: brand.textLight, lineHeight: 1.5 }}>
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
              <p style={{ fontSize: 14, color: brand.textLight, lineHeight: 1.5 }}>
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
              <p style={{ fontSize: 14, color: brand.textLight, lineHeight: 1.5 }}>
                Our pros arrive on time and leave your windows sparkling
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section style={{ 
        padding: '80px 24px',
        background: 'white'
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            fontSize: 36, 
            fontWeight: 600, 
            color: brand.text,
            marginBottom: 16
          }}>
            Simple, Transparent Pricing
          </h2>
          <p style={{ 
            fontSize: 18, 
            color: brand.textLight,
            marginBottom: 48
          }}>
            Pricing based on your floor plan. No hidden fees.
          </p>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: 24 
          }}>
            <div style={{ 
              background: brand.bg, 
              borderRadius: 16, 
              padding: 32,
              border: `1px solid ${brand.primaryLight}`
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Studio</h3>
              <div style={{ fontSize: 36, fontWeight: 700, color: brand.text, marginBottom: 8 }}>
                $75<span style={{ fontSize: 16, fontWeight: 400, color: brand.textLight }}>+</span>
              </div>
              <p style={{ fontSize: 14, color: brand.textLight }}>Starting price</p>
            </div>
            
            <div style={{ 
              background: brand.primary, 
              borderRadius: 16, 
              padding: 32,
              transform: 'scale(1.05)'
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 8 }}>1-2 Bedroom</h3>
              <div style={{ fontSize: 36, fontWeight: 700, color: brand.text, marginBottom: 8 }}>
                $99<span style={{ fontSize: 16, fontWeight: 400, color: brand.text }}>+</span>
              </div>
              <p style={{ fontSize: 14, color: brand.text }}>Most popular</p>
            </div>
            
            <div style={{ 
              background: brand.bg, 
              borderRadius: 16, 
              padding: 32,
              border: `1px solid ${brand.primaryLight}`
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: brand.text, marginBottom: 8 }}>3+ Bedroom</h3>
              <div style={{ fontSize: 36, fontWeight: 700, color: brand.text, marginBottom: 8 }}>
                $149<span style={{ fontSize: 16, fontWeight: 400, color: brand.textLight }}>+</span>
              </div>
              <p style={{ fontSize: 14, color: brand.textLight }}>Starting price</p>
            </div>
          </div>
          
          <p style={{ marginTop: 24, fontSize: 14, color: brand.textLight }}>
            Exact pricing shown at checkout based on your building and floor plan
          </p>
        </div>
      </section>

      {/* FAQs */}
      <section style={{ 
        padding: '80px 24px',
        background: brand.bg
      }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ 
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
            answer="Yes! Interior balcony windows and doors are included. Exterior high-rise windows require specialized equipment - contact us for a custom quote."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '80px 24px',
        background: brand.primary,
        textAlign: 'center'
      }}>
        <h2 style={{ 
          fontSize: 36, 
          fontWeight: 600, 
          color: brand.text,
          marginBottom: 16
        }}>
          Ready for crystal clear views?
        </h2>
        <p style={{ 
          fontSize: 18, 
          color: brand.text,
          marginBottom: 32,
          opacity: 0.8
        }}>
          Book your first cleaning in 60 seconds
        </p>
        <Link href="/login" style={{ 
          padding: '16px 48px', 
          fontSize: 18,
          fontWeight: 600,
          background: 'white', 
          border: 'none',
          borderRadius: 10,
          color: brand.text,
          cursor: 'pointer',
          textDecoration: 'none'
        }}>
          Get Started Now
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ 
        padding: '40px 24px',
        background: brand.text,
        color: 'white'
      }}>
        <div style={{ 
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
          
          <div style={{ display: 'flex', gap: 32, fontSize: 14, opacity: 0.8 }}>
            <span>Miami, FL</span>
            <span>hello@betterview.com</span>
            <span>(305) 555-0123</span>
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
          © 2025 BetterView Window Cleaning. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
