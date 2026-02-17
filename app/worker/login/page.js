'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#C9B037', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#C9B037', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#C9B037', borderRadius: 3 }} />
    </div>
  );
}

export default function WorkerLogin() {
  const router = useRouter();
  const { user, loading, signIn, signOut } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
    setSubmitting(true);

    // Step 1: Sign in with Supabase auth
    const { data, error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError.message);
      setSubmitting(false);
      return;
    }

    // Step 2: Verify this email belongs to a worker
    const { data: workerData } = await supabase
      .from('workers')
      .select('id')
      .eq('email', email)
      .single();

    if (!workerData) {
      // Not a worker — sign them out and show error
      await signOut();
      setError('No worker account found for this email. Contact your admin if you believe this is a mistake.');
      setSubmitting(false);
      return;
    }

    // Step 3: Redirect to worker dashboard
    router.push('/worker');
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
      <header style={{
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
        <Link href="/login" style={{
          padding: '10px 24px', fontSize: 16, fontWeight: 500,
          background: 'transparent', border: 'none', color: brand.text,
          cursor: 'pointer', textDecoration: 'none'
        }}>
          Customer Login
        </Link>
      </header>

      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 24px' }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          {/* Worker badge header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
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
            <h1 style={{ fontSize: 32, fontWeight: 600, color: brand.text, marginBottom: 8 }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 16, color: brand.textLight }}>
              Sign in to view your assigned jobs
            </p>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#DC2626' }}>
              {error}
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
              {submitting ? 'Signing in...' : 'Sign In'}
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
