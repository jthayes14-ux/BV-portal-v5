'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      <div style={{ width: 4, height: 22, background: '#6366F1', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#6366F1', borderRadius: 1 }} />
      <div style={{ width: 4, height: 22, background: '#6366F1', borderRadius: 1 }} />
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

  const font = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

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
      const { data: signUpData, error: signUpError } = await signUp(email, password, workerData.name);
      if (signUpError) {
        setError(signUpError.message);
        setSubmitting(false);
        return;
      }
      // Link the new auth account to the workers table
      if (signUpData?.user?.id) {
        await supabase
          .from('workers')
          .update({ auth_id: signUpData.user.id })
          .eq('email', email);
      }
      setMessage('Account created! Check your email for a confirmation link.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', background: '#fff',
        fontFamily: font
      }}>
        <div style={{
          width: 36, height: 36, border: '3px solid #E5E7EB', borderTop: '3px solid #6366F1',
          borderRadius: '50%', animation: 'loginSpin 0.8s linear infinite'
        }} />
        <p style={{ color: '#6B7280', fontSize: 14, marginTop: 16, fontWeight: 500 }}>Loading...</p>
        <style>{`@keyframes loginSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#F9FAFB',
      fontFamily: font
    }}>
      <header className="auth-header" style={{
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#fff',
        borderBottom: '1px solid #E5E7EB',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <Logo />
          <span style={{ fontSize: 18, fontWeight: 700, color: '#111827', letterSpacing: '-0.025em' }}>BetterView</span>
          <span style={{
            marginLeft: 4, padding: '3px 8px',
            background: '#6366F1', color: '#fff',
            borderRadius: 6, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em'
          }}>WORKER</span>
        </Link>
        <div className="desktop-nav">
          <Link href="/login" style={{
            padding: '8px 16px', fontSize: 13, fontWeight: 600,
            background: '#fff', border: '1px solid #E5E7EB', borderRadius: 8,
            color: '#111827', cursor: 'pointer', textDecoration: 'none',
            display: 'inline-block', transition: 'all 150ms ease'
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
            padding: '14px 16px', fontSize: 15, fontWeight: 600,
            color: '#111827', textDecoration: 'none', textAlign: 'center',
            borderRadius: 10, background: '#EEF2FF', display: 'block'
          }}>
            Customer Login
          </Link>
        </div>
      </header>

      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 24px' }}>
        <div style={{
          background: '#fff', borderRadius: 16, padding: '48px 40px', width: '100%', maxWidth: 420,
          boxShadow: '0 4px 24px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.03)'
        }}>
          {/* Worker badge header */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '8px 20px', background: '#6366F1',
              borderRadius: 100, marginBottom: 20
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', letterSpacing: '0.02em' }}>Worker Portal</span>
            </div>
          </div>

          {/* Toggle */}
          <div style={{ display: 'flex', background: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 28 }}>
            <button
              onClick={() => { setView('login'); setError(''); setMessage(''); }}
              style={{
                flex: 1, padding: '12px 24px', fontSize: 14, fontWeight: 600,
                background: view === 'login' ? '#6366F1' : 'transparent',
                color: view === 'login' ? '#fff' : '#6B7280',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setView('signup'); setError(''); setMessage(''); }}
              style={{
                flex: 1, padding: '12px 24px', fontSize: 14, fontWeight: 600,
                background: view === 'signup' ? '#6366F1' : 'transparent',
                color: view === 'signup' ? '#fff' : '#6B7280',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Create Account
            </button>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#111827', marginBottom: 8, textAlign: 'center', letterSpacing: '-0.025em' }}>
            {view === 'login' ? 'Welcome back' : 'Set up your account'}
          </h1>
          <p style={{ fontSize: 15, color: '#6B7280', marginBottom: 32, textAlign: 'center', lineHeight: 1.5 }}>
            {view === 'login' ? 'Sign in to view your assigned jobs' : 'Your admin must add you before you can create an account'}
          </p>

          {error && (
            <div style={{
              padding: '14px 16px', background: '#FEF2F2', borderRadius: 12,
              marginBottom: 20, fontSize: 14, color: '#DC2626', fontWeight: 500
            }}>
              {error}
            </div>
          )}
          {message && (
            <div style={{
              padding: '14px 16px', background: '#F0FDF4', borderRadius: 12,
              marginBottom: 20, fontSize: 14, color: '#16A34A', fontWeight: 500
            }}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Email Address</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                required
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1px solid #E5E7EB', borderRadius: 10,
                  fontSize: 16, boxSizing: 'border-box', outline: 'none',
                  fontFamily: font, transition: 'border-color 0.15s',
                  color: '#111827'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 8 }}>Password</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                required minLength={6}
                style={{
                  width: '100%', padding: '14px 16px',
                  border: '1px solid #E5E7EB', borderRadius: 10,
                  fontSize: 16, boxSizing: 'border-box', outline: 'none',
                  fontFamily: font, transition: 'border-color 0.15s',
                  color: '#111827'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366F1'}
                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            <button
              type="submit" disabled={submitting}
              style={{
                width: '100%', padding: '16px 24px', fontSize: 16, fontWeight: 600,
                background: submitting ? '#E5E7EB' : '#6366F1',
                border: 'none', borderRadius: 10, color: '#fff',
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'opacity 0.15s', fontFamily: font,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
              }}
              onMouseOver={(e) => { if (!submitting) e.target.style.opacity = '0.85'; }}
              onMouseOut={(e) => { e.target.style.opacity = '1'; }}
            >
              {submitting && (
                <span style={{
                  display: 'inline-block', width: 18, height: 18,
                  border: '2.5px solid rgba(255,255,255,0.3)', borderTop: '2.5px solid #fff',
                  borderRadius: '50%', animation: 'btnSpin 0.8s linear infinite'
                }} />
              )}
              {submitting ? 'Please wait...' : (view === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <p style={{ fontSize: 14, color: '#6B7280', marginTop: 28, textAlign: 'center' }}>
            Not a worker?{' '}
            <Link href="/login" style={{ color: '#6366F1', fontWeight: 600, textDecoration: 'none' }}>
              Customer login
            </Link>
          </p>
        </div>
      </main>

      <style>{`@keyframes btnSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
