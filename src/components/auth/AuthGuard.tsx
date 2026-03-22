// =====================================================
// AUTH GUARD COMPONENT
// Protects routes and handles authentication state
// =====================================================

'use client';

import { useUserStore, useAppStore } from '@/store';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm } from '@/components/auth/RegisterForm';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isLoggedIn, isLoading } = useUserStore();
  const { activePage } = useAppStore();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B0000]"></div>
      </div>
    );
  }

  // Show register page if not logged in and on register page
  if (!isLoggedIn && activePage === 'register') {
    return <RegisterForm />;
  }

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginForm />;
  }

  // User is logged in, show the app
  return <>{children}</>;
}
