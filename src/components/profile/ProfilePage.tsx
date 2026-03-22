// =====================================================
// PROFILE PAGE COMPONENT
// User profile and account management
// =====================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore, useAppStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users, ClipboardList, Wallet, UserPlus, User, FileText,
  List, Settings, ChevronRight, LogOut, Copy, Check, Crown,
  Receipt
} from 'lucide-react';

export function ProfilePage() {
  const { user, logout } = useUserStore();
  const { setActivePage } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  const handleNavigation = (page: string) => {
    setActivePage(page);
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    
    setLoggingOut(true);
    try {
      await logout();
      // The store will handle redirect, but in case it doesn't
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force reload on error
      window.location.href = '/';
    } finally {
      setLoggingOut(false);
    }
  };

  const copyInviteCode = async () => {
    if (user?.inviteCode) {
      await navigator.clipboard.writeText(user.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const menuItems = [
    { icon: Receipt, label: 'Transactions', page: 'transactions' },
    { icon: Users, label: 'Teams', page: 'teams' },
    { icon: ClipboardList, label: 'Record', page: 'record' },
    { icon: Wallet, label: 'Wallet', page: 'wallets' },
  ];

  const settingsItems = [
    { icon: UserPlus, label: 'Invite Friends', page: 'teams' },
    { icon: Settings, label: 'Settings', page: 'settings' },
  ];

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* User Profile Header */}
      <div className="bg-gradient-to-b from-[#6B0000] to-[#8B0000] text-white p-6 pb-8">
        <div className="flex items-center gap-4 mb-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 via-yellow-400 to-red-400 p-0.5">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
              <span className="text-2xl font-bold text-[#6B0000]">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl">{user?.username}</span>
              <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" />
                VIP {user?.vipLevel || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white/10 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/70 text-sm">My Balance</p>
              <p className="text-3xl font-bold mt-1">${(user?.balance ?? 0).toFixed(2)}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleNavigation('deposit')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                Deposit
              </button>
              <button
                onClick={() => handleNavigation('withdraw')}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600"
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Invite Code Card - PROMINENT */}
      <div className="mx-4 -mt-4">
        <Card className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600 font-medium">Your Invite Code</p>
            <Button
              onClick={copyInviteCode}
              size="sm"
              variant="outline"
              className="h-7 text-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 mr-1 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          </div>
          <p className="text-2xl font-bold text-[#6B0000] tracking-wider">{user?.inviteCode}</p>
          <p className="text-xs text-gray-500 mt-1">Share this code to invite new users</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-4 gap-2">
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(item.page)}
              className="flex flex-col items-center p-3 rounded-lg hover:bg-gray-50"
            >
              <item.icon className="w-6 h-6 text-[#6B0000]" />
              <span className="text-xs mt-2 text-gray-600">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Menu */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm overflow-hidden">
        {settingsItems.map((item, index) => (
          <button
            key={index}
            onClick={() => handleNavigation(item.page)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 border-b last:border-b-0"
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-5 h-5 text-gray-400" />
              <span>{item.label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        ))}
      </div>

      {/* Logout Button */}
      <div className="px-4 mt-6">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 p-4 bg-white rounded-lg text-red-500 font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <LogOut className="w-5 h-5" />
          {loggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
