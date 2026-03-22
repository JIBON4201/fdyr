// =====================================================
// HOME PAGE COMPONENT
// Main dashboard with user info and actions
// =====================================================

'use client';

import { useEffect, useState } from 'react';
import { useUserStore, useAppStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, Wallet, Users, UserPlus, ArrowLeftRight, Handshake, HelpCircle, Info } from 'lucide-react';

interface Setting {
  platform_intro?: string;
}

export function HomePage() {
  const { user } = useUserStore();
  const { setActivePage, setActiveTab } = useAppStore();
  const [settings, setSettings] = useState<Setting>({});

  useEffect(() => {
    // Fetch platform intro
    fetch('/api/settings/customer-service')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
        }
      });
  }, []);

  const handleNavigation = (page: string, tab?: string) => {
    setActivePage(page);
    if (tab) setActiveTab(tab as 'home' | 'service' | 'menu' | 'record' | 'mine');
  };

  const actions = [
    { 
      icon: TrendingUp, 
      label: 'Recharge', 
      color: 'text-red-500',
      onClick: () => handleNavigation('deposit'),
    },
    { 
      icon: Wallet, 
      label: 'Withdrawal', 
      color: 'text-red-500',
      onClick: () => handleNavigation('withdraw'),
    },
    { 
      icon: Users, 
      label: 'Teams', 
      color: 'text-red-500',
      onClick: () => handleNavigation('teams'),
    },
    { 
      icon: UserPlus, 
      label: 'Invitation', 
      color: 'text-red-500',
      onClick: () => handleNavigation('teams'),
    },
  ];

  const introCards = [
    {
      title: 'Platform profile',
      description: settings.platform_intro || 'MALL is an intelligent cloud global order matching center.',
      icon: Info,
    },
    {
      title: 'Platform rules',
      description: 'About recharge: The platform will change the recharge address from time to time.',
      icon: ArrowLeftRight,
    },
    {
      title: 'Win-win cooperation',
      description: 'At MALL, we carry out win-win cooperation for all users.',
      icon: Handshake,
    },
    {
      title: 'Instructions for use',
      description: 'To celebrate the MALL membership surpassing milestones.',
      icon: HelpCircle,
    },
  ];

  return (
    <div className="bg-gray-50">
      {/* User Profile Header */}
      <div className="bg-gradient-to-b from-[#6B0000] to-[#8B0000] text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-lg">{maskUsername(user?.username || '')}</span>
                <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-medium">
                  VIP {user?.vipLevel || 0}
                </span>
              </div>
              <span className="text-white/70 text-sm">successful</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white/70">Balance</p>
            <p className="text-2xl font-bold">{user?.balance?.toFixed(1) || '0'} USDT</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className="flex flex-col items-center p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              <action.icon className={`w-6 h-6 ${action.color}`} />
              <span className="text-xs mt-1">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Introduction */}
      <div className="p-4">
        <h2 className="font-bold text-lg mb-4">Platform introduction</h2>
        <div className="grid grid-cols-2 gap-3">
          {introCards.map((card, index) => (
            <Card key={index} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <card.icon className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-sm">{card.title}</h3>
              </div>
              <p className="text-xs text-gray-500 line-clamp-2">{card.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to mask username
function maskUsername(username: string): string {
  if (username.length <= 4) return username;
  const start = username.slice(0, 1);
  const end = username.slice(-1);
  return `${start}${'*'.repeat(Math.min(username.length - 2, 8))}${end}`;
}
