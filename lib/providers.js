'use client';
import { AuthProvider } from './useAuth';

export function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
