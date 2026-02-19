'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#C9B037', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#C9B037', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#C9B037', borderRadius: 0 }} />
    </div>
  );
}

export default function WorkerLogin() {
  const router = useRouter();
  const { user, loading, signIn, signUp, signOut } = useAuth();
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const brand = {
    primary: '#C9B037',
    primaryDark: '#A69028',
    primaryLight: '#F5F0DC',
    text: '#2D3748',
    textLight: '#718096',
    bg: '#FAFAF5',
  };

  useEffect(() => {
    if (!loading && user) {
      // If already logged in, check if they're a worker and redirect
      checkWorkerAndRedirect(user.email);
    }
  }, [user, loading]);

  const checkWorkerAndRedirect = async (workerEmail) => {
    const { data: workerData } = await supabase
      .from('workers')
      .select('id')
      .eq('email', workerEmail)
      .single();

    if (workerData) {
      router.push('/worker');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    // Always verify email is in workers table first
    const { data: workerData } = await supabase
      .from('workers')
      .select('id, name')
      .eq('email', email)
      .single();

    if (!workerData) {
      setError('No worker profile found for this email. Ask your admin to add you to the workers list first.');
      setSubmitting(false);
      return;
    }

    if (view === 'login') {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError.message);
        setSubmitting(false);
        return;
      }
      router.push('/worker');
    } else {
      // Sign up — create Supabase auth account using the worker's name
      const { error: signUpError } = await signUp(email, password, workerData.name);
      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }
      setMessage('Account created! Check your email for a confirmation link.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: brand.bg }}>
        <p style={{ color: brand.textLight }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(180deg, ${brand.bg} 0%, ${brand.primaryLight} 100%)`,
      fontFamily: "'Cormorant Garamond', Georgia, serif"
    }}>
      <header className="auth-header" style={{
        padding: '20px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'white',
        borderBottom: `1px solid ${brand.primaryLight}`,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 24, fontWeight: 600, color: brand.text }}>BetterView</span>
          <span style={{
            marginLeft: 4, padding: '4px 10px',
            background: brand.primary, color: 'white',
            borderRadius: 4, fontSize: 12, fontWeight: 600
          }}>WORKER</span>
        </Link>
        <div className="desktop-nav">
          <Link href="/login" style={{
            padding: '10px 24px', fontSize: 16, fontWeight: 500,
            background: 'transparent', border: 'none', color: brand.text,
            cursor: 'pointer', textDecoration: 'none'
          }}>
            Customer Login
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
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} style={{
            padding: '14px 16px', fontSize: 16, fontWeight: 500,
            color: brand.text, textDecoration: 'none', textAlign: 'center',
            borderRadius: 8, border: `1px solid ${brand.primaryLight}`
          }}>
            Customer Login
          </Link>
        </div>
      </header>

      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 24px' }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          {/* Worker badge header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', background: brand.primaryLight,
              borderRadius: 100, marginBottom: 20
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brand.primary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span style={{ fontSize: 14, fontWeight: 600, color: brand.primaryDark }}>Worker Portal</span>
            </div>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', background: brand.primaryLight, borderRadius: 10, padding: 4, marginBottom: 24 }}>
            <button
              onClick={() => { setView('login'); setError(''); setMessage(''); }}
              style={{ flex: 1, padding: '12px 24px', fontSize: 16, fontWeight: 600, background: view === 'login' ? 'white' : 'transparent', border: 'none', borderRadius: 8, color: brand.text, cursor: 'pointer', transition: 'background 0.2s' }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setView('signup'); setError(''); setMessage(''); }}
              style={{ flex: 1, padding: '12px 24px', fontSize: 16, fontWeight: 600, background: view === 'signup' ? 'white' : 'transparent', border: 'none', borderRadius: 8, color: brand.text, cursor: 'pointer', transition: 'background 0.2s' }}
            >
              Create Account
            </button>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 600, color: brand.text, marginBottom: 8, textAlign: 'center' }}>
            {view === 'login' ? 'Welcome back' : 'Set up your account'}
          </h1>
          <p style={{ fontSize: 16, color: brand.textLight, marginBottom: 32, textAlign: 'center' }}>
            {view === 'login' ? 'Sign in to view your assigned jobs' : 'Your admin must add you before you can create an account'}
          </p>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#DC2626' }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{ padding: '12px 16px', background: '#DCFCE7', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#16A34A' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Email Address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                required
                style={{ width: '100%', padding: '14px 16px', border: `1px solid ${brand.primaryLight}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = brand.primary}
                onBlur={(e) => e.target.style.borderColor = brand.primaryLight}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                required minLength={6}
                style={{ width: '100%', padding: '14px 16px', border: `1px solid ${brand.primaryLight}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                onFocus={(e) => e.target.style.borderColor = brand.primary}
                onBlur={(e) => e.target.style.borderColor = brand.primaryLight}
              />
            </div>

            <button
              type="submit" disabled={submitting}
              style={{
                width: '100%', padding: '16px 24px', fontSize: 18, fontWeight: 600,
                background: submitting ? brand.primaryLight : brand.primary,
                border: 'none', borderRadius: 10, color: 'white',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => { if (!submitting) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 4px 12px rgba(201, 176, 55, 0.4)`; }}}
              onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
            >
              {submitting ? 'Please wait...' : (view === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ fontSize: 14, color: brand.textLight, marginTop: 24, textAlign: 'center' }}>
            Not a worker?{' '}
            <Link href="/login" style={{ color: brand.primaryDark, fontWeight: 500, textDecoration: 'none' }}>
              Customer login
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
