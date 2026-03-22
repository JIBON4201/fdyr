// =====================================================
// BOTTOM NAVIGATION COMPONENT
// Fixed bottom navigation bar
// =====================================================

'use client';

import { useCallback } from 'react';
import { Home, Headphones, ShoppingBag, ClipboardList, User } from 'lucide-react';
import { useAppStore } from '@/store';
import type { ActiveTab } from '@/store';

const navItems: Array<{ id: ActiveTab; label: string; icon: typeof Home; hash: string }> = [
  { id: 'home', label: 'Home', icon: Home, hash: '/hor' },
  { id: 'service', label: 'Service', icon: Headphones, hash: '/ser' },
  { id: 'menu', label: 'Menu', icon: ShoppingBag, hash: '/pro' },
  { id: 'record', label: 'Record', icon: ClipboardList, hash: '/rec' },
  { id: 'mine', label: 'Mine', icon: User, hash: '/me' },
];

export function BottomNav() {
  const { activeTab, setActiveTab, setActivePage } = useAppStore();

  const handleClick = useCallback((item: typeof navItems[0]) => {
    setActiveTab(item.id);
    setActivePage(item.id === 'home' ? 'main' : item.id);
    // Use history.pushState to update hash without triggering hashchange event
    if (typeof window !== 'undefined') {
      const newHash = `#${item.hash}`;
      if (window.location.hash !== newHash) {
        window.history.pushState(null, '', newHash);
      }
    }
  }, [setActiveTab, setActivePage]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 safe-area-bottom">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleClick(item)}
              className={`flex flex-col items-center py-1 px-4 transition-colors ${
                isActive ? 'text-black' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'font-bold' : ''}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
