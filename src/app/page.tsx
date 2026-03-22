// =====================================================
// MAIN APPLICATION PAGE
// Single-page application with conditional rendering
// Updated: force rebuild
// =====================================================

'use client';

import { useEffect } from 'react';
import { useUserStore, useAppStore } from '@/store';
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function Page() {
  const { refreshUser, isLoading } = useUserStore();
  const { setActivePage } = useAppStore();

  useEffect(() => {
    // Check if user is logged in on mount
    refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    // Check URL hash for routing
    const checkRoute = () => {
      const hash = window.location.hash;
      if (hash.includes('/reg')) {
        setActivePage('register');
      } else if (hash.includes('/login')) {
        setActivePage('login');
      } else if (hash.includes('/dep')) {
        setActivePage('deposit');
      } else if (hash.includes('/out')) {
        setActivePage('withdraw');
      } else if (hash.includes('/pro')) {
        setActivePage('menu');
      } else if (hash.includes('/rec')) {
        setActivePage('record');
      } else if (hash.includes('/ser')) {
        setActivePage('service');
      } else if (hash.includes('/me')) {
        setActivePage('mine');
      } else if (hash.includes('/hor')) {
        setActivePage('main');
      } else if (hash.includes('/tea')) {
        setActivePage('teams');
      } else if (hash.includes('/msg')) {
        setActivePage('messages');
      } else if (hash.includes('/wal')) {
        setActivePage('wallets');
      } else if (hash.includes('/set')) {
        setActivePage('settings');
      } else if (hash.includes('/pro')) {
        setActivePage('profile');
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    return () => window.removeEventListener('hashchange', checkRoute);
  }, [setActivePage]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B0000]"></div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <MainLayout />
    </AuthGuard>
  );
}
