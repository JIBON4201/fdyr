// =====================================================
// MAIN LAYOUT COMPONENT
// Main application layout with bottom navigation
// =====================================================

'use client';

import { useAppStore, useUserStore } from '@/store';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomePage } from '@/components/home/HomePage';
import { MenuPage } from '@/components/menu/MenuPage';
import { RecordPage } from '@/components/record/RecordPage';
import { ServicePage } from '@/components/service/ServicePage';
import { ProfilePage } from '@/components/profile/ProfilePage';
import { DepositPage } from '@/components/deposit/DepositPage';
import { WithdrawPage } from '@/components/withdraw/WithdrawPage';
import { TeamsPage } from '@/components/teams/TeamsPage';
import { MessagesPage } from '@/components/messages/MessagesPage';
import { SettingsPage } from '@/components/profile/SettingsPage';
import { WalletsPage } from '@/components/profile/WalletsPage';
import { TransactionHistoryPage } from '@/components/transactions/TransactionHistoryPage';
import { Header } from '@/components/layout/Header';

export function MainLayout() {
  const { activeTab, activePage } = useAppStore();
  const { user } = useUserStore();

  // Determine which page to show
  const renderPage = () => {
    switch (activePage) {
      case 'deposit':
        return <DepositPage />;
      case 'withdraw':
        return <WithdrawPage />;
      case 'teams':
        return <TeamsPage />;
      case 'messages':
        return <MessagesPage />;
      case 'settings':
        return <SettingsPage />;
      case 'wallets':
        return <WalletsPage />;
      case 'menu':
        return <MenuPage />;
      case 'record':
        return <RecordPage />;
      case 'service':
        return <ServicePage />;
      case 'transactions':
        return <TransactionHistoryPage />;
      case 'mine':
        return <ProfilePage />;
      case 'main':
      default:
        return <HomePage />;
    }
  };

  // Show header for sub-pages
  const showHeader = !['main'].includes(activePage);
  const showBottomNav = ['main', 'menu', 'record', 'service', 'mine'].includes(activePage) ||
    (activeTab && ['home', 'service', 'menu', 'record', 'mine'].includes(activeTab));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header for sub-pages */}
      {showHeader && <Header />}

      {/* Main content */}
      <main className={`flex-1 ${showBottomNav ? 'pb-20' : ''}`}>
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}
    </div>
  );
}
