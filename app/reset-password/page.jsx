'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';

function Logo() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
      <div style={{ width: 8, height: 28, background: '#B8C5F2', borderRadius: 0 }} />
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [loading, setLoading] = useState(true);

  const brand = {
    primary: '#B8C5F2',
    primaryDark: '#9AA8E0',
    primaryLight: '#E8EDFC',
    text: '#2D3748',
    textLight: '#718096',
    bg: '#F8FAFF',
  };

  useEffect(() => {
    const processToken = async () => {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');
      const type = params.get('type');

      if (!accessToken || type !== 'recovery') {
        setTokenError(true);
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || '',
      });

      if (error) {
        setTokenError(true);
      }

      setLoading(false);
    };

    processToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setError(error.message);
      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);
    setTimeout(() => router.push('/login'), 2000);
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
        </Link>
        <Link href="/login" style={{ padding: '10px 24px', fontSize: 16, fontWeight: 500, color: brand.text, textDecoration: 'none' }}>
          Log in
        </Link>
      </header>

      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)', padding: '40px 24px' }}>
        <div style={{
          background: 'white', borderRadius: 20, padding: '48px 40px', width: '100%', maxWidth: 420,
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)'
        }}>
          {tokenError ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: brand.text, marginBottom: 12, textAlign: 'center' }}>
                Link Expired
              </h1>
              <p style={{ fontSize: 16, color: brand.textLight, marginBottom: 32, textAlign: 'center', lineHeight: 1.6 }}>
                This reset link has expired. Please request a new one.
              </p>
              <Link href="/login" style={{
                display: 'block', width: '100%', padding: '16px 24px', fontSize: 18, fontWeight: 600,
                background: brand.primary, border: 'none', borderRadius: 10, color: brand.text,
                textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box'
              }}>
                Back to Login
              </Link>
            </>
          ) : success ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 600, color: brand.text, marginBottom: 12, textAlign: 'center' }}>
                Password Updated
              </h1>
              <p style={{ fontSize: 16, color: brand.textLight, textAlign: 'center', lineHeight: 1.6 }}>
                Your password has been reset successfully. Redirecting to login...
              </p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: 32, fontWeight: 600, color: brand.text, marginBottom: 8, textAlign: 'center' }}>
                Reset Password
              </h1>
              <p style={{ fontSize: 16, color: brand.textLight, marginBottom: 32, textAlign: 'center' }}>
                Enter your new password below
              </p>

              {error && (
                <div style={{ padding: '12px 16px', background: '#FEE2E2', borderRadius: 8, marginBottom: 20, fontSize: 14, color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '14px 16px', border: `1px solid ${brand.primaryLight}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = brand.primary}
                    onBlur={(e) => e.target.style.borderColor = brand.primaryLight}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: brand.text, marginBottom: 8 }}>Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    style={{ width: '100%', padding: '14px 16px', border: `1px solid ${brand.primaryLight}`, borderRadius: 10, fontSize: 16, boxSizing: 'border-box', outline: 'none' }}
                    onFocus={(e) => e.target.style.borderColor = brand.primary}
                    onBlur={(e) => e.target.style.borderColor = brand.primaryLight}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
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
                  {submitting ? 'Updating...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
