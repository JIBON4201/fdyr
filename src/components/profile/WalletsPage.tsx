// =====================================================
// WALLETS PAGE COMPONENT
// User wallet address management
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import type { Wallet } from '@/types';

export function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [address, setAddress] = useState('');
  const [protocol, setProtocol] = useState('TRC-20');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await fetch('/api/wallets/list');
      const data = await res.json();
      if (data.success) {
        setWallets(data.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch('/api/wallets/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, protocol }),
      });

      const data = await res.json();

      if (data.success) {
        setWallets([...wallets, data.data]);
        setAddress('');
        setShowAddForm(false);
      } else {
        alert(data.error || 'Failed to add wallet');
      }
    } catch {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (!confirm('Are you sure you want to delete this wallet?')) return;

    try {
      const res = await fetch(`/api/wallets/list?id=${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        setWallets(wallets.filter((w) => w.id !== id));
      }
    } catch {
      alert('Failed to delete wallet');
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Wallet List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0000]"></div>
        </div>
      ) : wallets.length === 0 && !showAddForm ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500 mb-4">No wallet addresses added</p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-[#6B0000] hover:bg-[#8B0000]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Wallet
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Virtual Currency Card */}
          <Card className="p-4">
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

          {/* Wallet List */}
          {wallets.map((wallet) => (
            <Card key={wallet.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-gray-500 text-sm">{wallet.protocol}</p>
                  <p className="font-mono text-sm mt-1 break-all">{wallet.address}</p>
                </div>
                <button
                  onClick={() => handleDeleteWallet(wallet.id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}

          {/* Add Button */}
          <Button
            onClick={() => setShowAddForm(true)}
            variant="outline"
            className="w-full border-dashed"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Wallet
          </Button>
        </div>
      )}

      {/* Add Wallet Form */}
      {showAddForm && (
        <Card className="mt-4 p-4">
          <h3 className="font-semibold mb-4">Add E-Wallet</h3>
          <form onSubmit={handleAddWallet} className="space-y-4">
            <div className="space-y-2">
              <Label>Protocol</Label>
              <div className="grid grid-cols-2 gap-2">
                {['TRC-20', 'ERC-20'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProtocol(p)}
                    className={`p-3 rounded-lg border ${
                      protocol === p
                        ? 'border-[#6B0000] bg-red-50'
                        : 'border-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter wallet address"
                required
              />
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#6B0000] hover:bg-[#8B0000]"
                disabled={submitting}
              >
                {submitting ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
