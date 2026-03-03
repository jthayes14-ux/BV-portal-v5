'use client';
import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef(null);

  useEffect(() => {
    // Guard against React Strict Mode double-mount setting up duplicate listeners,
    // which causes competing Navigator Lock acquisitions and the lock timeout error.
    if (subscriptionRef.current) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      // INITIAL_SESSION fires once when the listener is first set up,
      // replacing the separate getSession() call that caused lock contention.
      if (event === 'INITIAL_SESSION') {
        setLoading(false);
      }

      // Link any unlinked guest bookings when a user signs in.
      // Fire-and-forget: do NOT await inside this callback, as the RPC call
      // internally acquires the auth lock to read the token, which can deadlock
      // if this callback is blocking the lock release.
      if (event === 'SIGNED_IN' && session?.user?.id && session?.user?.email) {
        supabase.rpc('link_guest_bookings', {
          user_uuid: session.user.id,
          user_email: session.user.email,
        }).catch((err) => console.error('Failed to link guest bookings:', err));
      }
    });

    subscriptionRef.current = subscription;

    return () => {
      subscription.unsubscribe();
      subscriptionRef.current = null;
    };
  }, []);

  const signUp = async (email, password, name) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
