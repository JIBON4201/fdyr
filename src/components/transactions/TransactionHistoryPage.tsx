// =====================================================
// TRANSACTION HISTORY PAGE COMPONENT
// Shows all transactions: purchases, deposits, withdrawals
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ShoppingCart, ArrowDownLeft, ArrowUpRight, CheckCircle, Clock,
  XCircle, Package, Wallet, RefreshCw
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'purchase' | 'deposit' | 'withdraw';
  amount: number;
  status: string;
  commission?: number;
  productName?: string;
  productIcon?: string;
  address?: string | null;
  protocol?: string | null;
  adminNote?: string | null;
  createdAt: string;
}

interface TransactionData {
  transactions: Transaction[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function TransactionHistoryPage() {
  const [data, setData] = useState<TransactionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [activeTab, page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions/all?type=${activeTab}&page=${page}&limit=20`);
      const responseData = await res.json();
      if (responseData.success) {
        setData(responseData.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'purchase':
        return <ShoppingCart className="w-5 h-5" />;
      case 'deposit':
        return <ArrowDownLeft className="w-5 h-5" />;
      case 'withdraw':
        return <ArrowUpRight className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-100 text-blue-600';
      case 'deposit':
        return 'bg-green-100 text-green-600';
      case 'withdraw':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'Product Purchase';
      case 'deposit':
        return 'Deposit';
      case 'withdraw':
        return 'Withdrawal';
      default:
        return type;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAmountDisplay = (tx: Transaction) => {
    if (tx.type === 'purchase') {
      return {
        main: `-$${tx.amount.toFixed(2)}`,
        sub: `+$${(tx.commission || 0).toFixed(2)} commission`,
        color: 'text-blue-600',
        subColor: 'text-green-600',
      };
    } else if (tx.type === 'deposit') {
      return {
        main: `+$${tx.amount.toFixed(2)}`,
        sub: null,
        color: 'text-green-600',
        subColor: '',
      };
    } else {
      return {
        main: `-$${tx.amount.toFixed(2)}`,
        sub: null,
        color: 'text-orange-600',
        subColor: '',
      };
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#6B0000] to-[#8B0000] text-white p-6">
        <h1 className="text-xl font-bold text-center">Transaction History</h1>
        <p className="text-sm text-white/70 text-center mt-1">All your purchases, deposits, and withdrawals</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3 p-4 -mt-4">
        <Card className="p-3 text-center">
          <ShoppingCart className="w-6 h-6 mx-auto text-blue-500 mb-1" />
          <p className="text-lg font-bold text-blue-600">
            {data?.transactions.filter(t => t.type === 'purchase').length || 0}
          </p>
          <p className="text-xs text-gray-500">Purchases</p>
        </Card>
        <Card className="p-3 text-center">
          <ArrowDownLeft className="w-6 h-6 mx-auto text-green-500 mb-1" />
          <p className="text-lg font-bold text-green-600">
            {data?.transactions.filter(t => t.type === 'deposit').length || 0}
          </p>
          <p className="text-xs text-gray-500">Deposits</p>
        </Card>
        <Card className="p-3 text-center">
          <ArrowUpRight className="w-6 h-6 mx-auto text-orange-500 mb-1" />
          <p className="text-lg font-bold text-orange-600">
            {data?.transactions.filter(t => t.type === 'withdraw').length || 0}
          </p>
          <p className="text-xs text-gray-500">Withdrawals</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="bg-white px-4 py-3 border-b sticky top-0 z-10">
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setPage(1); }}>
          <TabsList className="w-full grid grid-cols-4 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="purchase" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              <ShoppingCart className="w-4 h-4 mr-1" />
              Buy
            </TabsTrigger>
            <TabsTrigger value="deposit" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              <ArrowDownLeft className="w-4 h-4 mr-1" />
              In
            </TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Out
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Transaction List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-8 h-8 animate-spin text-[#6B0000]" />
          </div>
        ) : data?.transactions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No transactions found</p>
          </div>
        ) : (
          data?.transactions.map((tx) => {
            const amountDisplay = getAmountDisplay(tx);
            return (
              <Card key={`${tx.type}-${tx.id}`} className="p-4">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(tx.type)}`}>
                    {tx.type === 'purchase' && tx.productIcon ? (
                      <span className="text-lg">{tx.productIcon}</span>
                    ) : (
                      getTypeIcon(tx.type)
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{getTypeLabel(tx.type)}</p>
                      {tx.productName && (
                        <span className="text-sm text-gray-500">- {tx.productName}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      {getStatusIcon(tx.status)}
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </span>
                    </div>

                    {tx.address && (
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        To: {tx.address.slice(0, 10)}...{tx.address.slice(-6)}
                      </p>
                    )}

                    {tx.protocol && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Protocol: {tx.protocol}
                      </p>
                    )}

                    {tx.adminNote && (
                      <p className="text-xs text-red-500 mt-1">
                        Note: {tx.adminNote}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(tx.createdAt)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-right">
                    <p className={`font-bold ${amountDisplay.color}`}>
                      {amountDisplay.main}
                    </p>
                    {amountDisplay.sub && (
                      <p className={`text-xs ${amountDisplay.subColor}`}>
                        {amountDisplay.sub}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-white rounded-lg border">
              {page} / {data.totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="px-4 py-2 bg-white rounded-lg border disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
