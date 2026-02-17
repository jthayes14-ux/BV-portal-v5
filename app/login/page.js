'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/useAuth';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 3 }} />
    </div>
  );
}

export default function AuthPages() {
  const router = useRouter();
  const { user, loading, signIn, signUp, resetPassword } = useAuth();
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const brand = {
    primary: '#B8C5F2',
    primaryDark: '#9AA8E0',
    primaryLight: '#E8EDFC',
    text: '#2D3748',
    textLight: '#718096',
    bg: '#F8FAFF',
  };

  useEffect(() => {
    if (!loading && user) {
      router.push('/book');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    if (view === 'login') {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
        setSubmitting(false);
      }
    } else if (view === 'signup') {
      const { error } = await signUp(email, password, name);
      if (error) {
        setError(error.message);
        setSubmitting(false);
      } else {
        setMessage('Check your email for a confirmation link.');
        setSubmitting(false);
      }
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address first.');
      return;
    }
    setError('');
    setMessage('');
    setSubmitting(true);
    const { error } = await resetPassword(email);
    if (error) {
      setError(error.message);
    } else {
      setMessage('Password reset link sent to your email.');
    }
    setSubmitting(false);
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
        </Link>
        <div className="header-actions" style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => { setView('login'); setError(''); setMessage(''); }}
            style={{ padding: '10px 24px', fontSize: 16, fontWeight: 500, background: 'transparent', border: 'none', color: brand.text, cursor: 'pointer' }}
          >
            Log in
          </button>
          <button
            onClick={() => { setView('signup'); setError(''); setMessage(''); }}
            style={{ padding: '10px 24px', fontSize: 16, fontWeight: 500, background: brand.primary, border: 'none', borderRadius: 8, color: brand.text, cursor: 'pointer' }}
          >
            Get Started
          </button>
        </div>
      </header>

      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 24px' }}>
        <div className="auth-form-card" style={{
          background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          {/* Toggle */}
          <div style={{ display: 'flex', background: brand.primaryLight, borderRadius: 10, padding: 4, marginBottom: 32 }}>
            <button
              onClick={() => { setView('login'); setError(''); setMessage(''); }}
              style={{ flex: 1, padding: '12px 24px', fontSize: 16, fontWeight: 600, background: view === 'login' ? 'white' : 'transparent', border: 'none', borderRadius: 8, color: brand.text, cursor: 'pointer', transition: 'background 0.2s' }}
            >
              Log In
            </button>
            <button
              onClick={() => { setView('signup'); setError(''); setMessage(''); }}
              style={{ flex: 1, padding: '12px 24px', fontSize: 16, fontWeight: 600, background: view === 'signup' ? 'white' : 'transparent', border: 'none', borderRadius: 8, color: brand.text, cursor: 'pointer', transition: 'background 0.2s' }}
            >
              Sign Up
            </button>
          </div>

          <h1 style={{ fontSize: 32, fontWeight: 600, color: brand.text, marginBottom: 8, textAlign: 'center' }}>
            {view === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p style={{ fontSize: 16, color: brand.textLight, marginBottom: 32, textAlign: 'center' }}>
            {view === 'login' ? 'Log in to manage your bookings' : 'Book your first window cleaning in 60 seconds'}
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
            {view === 'signup' && (
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Full Name</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith"
                  required
                  style={{ width: '100%', padding: '14px 16px', border: `1px solid ${brand.primaryLight}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                  onFocus={(e) => e.target.style.borderColor = brand.primary}
                  onBlur={(e) => e.target.style.borderColor = brand.primaryLight}
                />
              </div>
            )}

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
              {view === 'login' && (
                <p
                  onClick={handleForgotPassword}
                  style={{ fontSize: 14, color: brand.primaryDark, marginTop: 8, textAlign: 'right', cursor: 'pointer' }}
                >
                  Forgot password?
                </p>
              )}
            </div>

            <button
              type="submit" disabled={submitting}
              style={{
                width: '100%', padding: '16px 24px', fontSize: 18, fontWeight: 600,
                background: submitting ? brand.primaryLight : brand.primary,
                border: 'none', borderRadius: 10, color: brand.text,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseOver={(e) => { if (!submitting) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 4px 12px rgba(184, 197, 242, 0.4)'; }}}
              onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = 'none'; }}
            >
              {submitting ? 'Please wait...' : (view === 'login' ? 'Log In' : 'Create Account')}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '28px 0', gap: 16 }}>
            <div style={{ flex: 1, height: 1, background: brand.primaryLight }} />
            <span style={{ fontSize: 14, color: brand.textLight }}>or continue with</span>
            <div style={{ flex: 1, height: 1, background: brand.primaryLight }} />
          </div>

          {/* Social Login */}
          <div className="social-login-row" style={{ display: 'flex', gap: 12 }}>
            <button style={{ flex: 1, padding: '14px 24px', fontSize: 16, fontWeight: 500, background: 'white', border: `1px solid ${brand.primaryLight}`, borderRadius: 10, color: brand.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button style={{ flex: 1, padding: '14px 24px', fontSize: 16, fontWeight: 500, background: 'white', border: `1px solid ${brand.primaryLight}`, borderRadius: 10, color: brand.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#000">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

          {view === 'signup' && (
            <p style={{ fontSize: 13, color: brand.textLight, marginTop: 24, textAlign: 'center', lineHeight: 1.5 }}>
              By creating an account, you agree to our{' '}
              <span style={{ color: brand.primaryDark, cursor: 'pointer' }}>Terms of Service</span>
              {' '}and{' '}
              <span style={{ color: brand.primaryDark, cursor: 'pointer' }}>Privacy Policy</span>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
