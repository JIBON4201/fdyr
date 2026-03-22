// =====================================================
// HEADER COMPONENT
// Page header with navigation
// =====================================================

'use client';

import { ArrowLeft } from 'lucide-react';
import { useAppStore } from '@/store';

const pageTitles: Record<string, string> = {
  deposit: 'Deposit',
  withdraw: 'Withdrawal',
  teams: 'Teams',
  messages: 'Message Center',
  settings: 'Setting',
  wallets: 'Wallet management',
  profile: 'Profile',
};

export function Header() {
  const { activePage, setActivePage, setActiveTab } = useAppStore();

  const handleBack = () => {
    setActivePage('main');
    setActiveTab('home');
    window.location.hash = '/hor';
  };

  const title = pageTitles[activePage] || 'MALL';

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-3">
        <button 
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-full -ml-2"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-semibold text-lg">{title}</h1>
        <div className="w-9"></div>
      </div>
    </header>
  );
}
