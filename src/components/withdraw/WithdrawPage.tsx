// =====================================================
// WITHDRAW PAGE COMPONENT
// User withdrawal functionality
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import type { Wallet } from '@/types';

export function WithdrawPage() {
  const { user } = useUserStore();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newProtocol, setNewProtocol] = useState('TRC-20');

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await fetch('/api/wallets/list');
      const data = await res.json();
      if (data.success) {
        setWallets(data.data);
        if (data.data.length > 0) {
          setSelectedWallet(data.data[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    if (!newAddress) return;

    try {
      const res = await fetch('/api/wallets/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: newAddress, protocol: newProtocol }),
      });

      const data = await res.json();

      if (data.success) {
        setWallets([...wallets, data.data]);
        setSelectedWallet(data.data);
        setShowAddWallet(false);
        setNewAddress('');
      } else {
        alert(data.error || 'Failed to add wallet');
      }
    } catch {
      alert('Network error');
    }
  };

  const handleWithdraw = async () => {
    if (!selectedWallet) {
      alert('Please select a wallet address');
      return;
    }

    if (!amount || parseFloat(amount) < 1) {
      alert('Minimum withdrawal amount is 1 USDT');
      return;
    }

    if (parseFloat(amount) > (user?.balance || 0)) {
      alert('Insufficient balance');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/transactions/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          walletId: selectedWallet.id,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert('Withdrawal request submitted successfully!');
        setAmount('');
        // Refresh user balance
        window.location.reload();
      } else {
        alert(data.error || 'Withdrawal failed');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0000]"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Wallet Selection */}
      {wallets.length === 0 && !showAddWallet ? (
        <Card className="p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-blue-500 font-bold text-2xl">D</span>
          </div>
          <p className="text-gray-600 mb-4">Virtual currency</p>
          <Button
            onClick={() => setShowAddWallet(true)}
            className="bg-[#6B0000] hover:bg-[#8B0000]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add e-wallet
          </Button>
          <p className="text-gray-500 text-sm mt-4">
            Please bind an electronic wallet for withdrawal
          </p>
        </Card>
      ) : showAddWallet ? (
        <Card className="p-4">
          <h3 className="font-semibold mb-4">Add E-Wallet</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Protocol</label>
              <div className="grid grid-cols-2 gap-2">
                {['TRC-20', 'ERC-20'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setNewProtocol(p)}
                    className={`p-3 rounded-lg border ${
                      newProtocol === p ? 'border-[#6B0000] bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-2 block">Wallet Address</label>
              <Input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter wallet address"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddWallet(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddWallet} className="flex-1 bg-[#6B0000] hover:bg-[#8B0000]">
                Add
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Virtual Currency Card */}
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-500 font-bold text-lg">D</span>
              </div>
              <div>
                <p className="font-semibold">Virtual currency</p>
                <p className="text-gray-500 text-sm">USDT</p>
              </div>
            </div>
          </Card>

          {/* Wallet Selection */}
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Select Wallet</h3>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.id}
                  onClick={() => setSelectedWallet(wallet)}
                  className={`w-full p-3 rounded-lg border text-left ${
                    selectedWallet?.id === wallet.id
                      ? 'border-[#6B0000] bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <p className="text-xs text-gray-500">{wallet.protocol}</p>
                  <p className="font-mono text-sm truncate">{wallet.address}</p>
                </button>
              ))}
              <Button
                variant="outline"
                onClick={() => setShowAddWallet(true)}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Wallet
              </Button>
            </div>
          </Card>

          {/* Amount */}
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Withdrawal Amount</h3>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              className="text-lg"
              min="1"
              step="0.1"
            />
            <div className="flex justify-between mt-2">
              <p className="text-sm text-gray-500">
                Available: {user?.balance?.toFixed(2) || '0'} USDT
              </p>
              <button
                onClick={() => setAmount((user?.balance || 0).toString())}
                className="text-sm text-[#6B0000]"
              >
                All
              </button>
            </div>
          </Card>

          {/* Submit Button */}
          <Button
            onClick={handleWithdraw}
            className="w-full bg-[#6B0000] hover:bg-[#8B0000] py-6 text-lg"
            disabled={submitting || !amount || !selectedWallet}
          >
            {submitting ? 'Processing...' : 'Withdraw'}
          </Button>
        </>
      )}
    </div>
  );
}
