// =====================================================
// RECORD PAGE COMPONENT
// Transaction history with tabs
// =====================================================

'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import type { Transaction } from '@/types';

export function RecordPage() {
  const { setActivePage } = useAppStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incomplete');

  useEffect(() => {
    const status = activeTab === 'incomplete' ? 'pending' : 'approved';
    fetch(`/api/transactions/list?status=${activeTab === 'incomplete' ? 'incomplete' : 'complete'}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTransactions(data.data.transactions);
        }
        setLoading(false);
      });
  }, [activeTab]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="text-green-500 text-sm font-medium">Completed</span>;
      case 'pending':
        return <span className="text-yellow-500 text-sm font-medium">Pending</span>;
      case 'rejected':
        return <span className="text-red-500 text-sm font-medium">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold text-center">Record</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 bg-transparent">
            <TabsTrigger 
              value="incomplete" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent"
            >
              Incomplete
            </TabsTrigger>
            <TabsTrigger 
              value="complete" 
              className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none bg-transparent"
            >
              Complete
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transactions List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0000]"></div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No more</div>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-semibold capitalize">{tx.type}</h3>
                  <p className="text-gray-500 text-sm">{formatDate(tx.createdAt)}</p>
                </div>
                {getStatusBadge(tx.status)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Amount</span>
                <span className="font-bold text-lg">{tx.amount} USDT</span>
              </div>
              {tx.address && (
                <p className="text-gray-400 text-xs mt-2 truncate">
                  Address: {tx.address}
                </p>
              )}
            </Card>
          ))
        )}

        {transactions.length > 0 && (
          <p className="text-center text-gray-400 text-sm py-4">No more</p>
        )}
      </div>
    </div>
  );
}
