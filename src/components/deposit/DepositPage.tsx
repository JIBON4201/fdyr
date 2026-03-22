// =====================================================
// DEPOSIT PAGE COMPONENT
// User deposit functionality
// =====================================================

'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { DepositAddress } from '@/types';

export function DepositPage() {
  const { user } = useUserStore();
  const [amount, setAmount] = useState('');
  const [protocol, setProtocol] = useState('TRC-20');
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddress, setShowAddress] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<DepositAddress | null>(null);

  useEffect(() => {
    // Fetch deposit addresses
    fetch('/api/admin/addresses')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const activeAddresses = data.data.filter((a: DepositAddress) => a.isActive);
          setAddresses(activeAddresses);
          if (activeAddresses.length > 0) {
            setSelectedAddress(activeAddresses.find((a: DepositAddress) => a.protocol === protocol) || activeAddresses[0]);
          }
        }
        setLoading(false);
      });
  }, [protocol]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 0.1) {
      alert('Minimum deposit amount is 0.1 USDT');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(amount),
          protocol,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setShowAddress(true);
        setSelectedAddress({
          address: data.data.address,
          protocol: data.data.protocol,
        } as DepositAddress);
      } else {
        alert(data.error || 'Deposit failed');
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

  if (showAddress && selectedAddress) {
    return (
      <div className="bg-gray-50 min-h-screen p-4">
        <Card className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Deposit Address</h2>
          <p className="text-gray-500 mb-4">Send USDT to this address via {selectedAddress.protocol}</p>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <p className="font-mono text-sm break-all">{selectedAddress.address}</p>
          </div>
          
          <p className="text-sm text-gray-500">
            Amount: <span className="font-bold text-black">{amount} USDT</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Protocol: <span className="font-bold text-black">{protocol}</span>
          </p>
          
          <Button
            onClick={() => {
              setShowAddress(false);
              setAmount('');
            }}
            className="mt-6 bg-[#6B0000] hover:bg-[#8B0000] w-full"
          >
            Done
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Payment Method */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-3">Payment method</h3>
        <div className="flex gap-3">
          <div className="flex-1 p-4 border-2 border-[#6B0000] rounded-lg flex flex-col items-center relative">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-500 font-bold">T</span>
            </div>
            <span className="mt-2 font-medium">USDT</span>
            <div className="absolute top-2 right-2 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-[#6B0000]"></div>
          </div>
        </div>
      </Card>

      {/* Protocol Selection */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-3">Select the protocol to use</h3>
        <div className="grid grid-cols-2 gap-3">
          {['TRC-20', 'ERC-20'].map((p) => (
            <button
              key={p}
              onClick={() => setProtocol(p)}
              className={`p-4 rounded-lg border-2 flex items-center justify-center relative ${
                protocol === p ? 'border-[#6B0000]' : 'border-gray-200'
              }`}
            >
              <span className="font-medium">{p}</span>
              {protocol === p && (
                <div className="absolute top-2 right-2 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-[#6B0000]"></div>
              )}
            </button>
          ))}
        </div>
      </Card>

      {/* Deposit Amount */}
      <Card className="p-4 mb-4">
        <h3 className="font-semibold mb-3">Deposit amount</h3>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="text-lg"
          min="0.1"
          step="0.1"
        />
        <p className="text-sm text-gray-500 mt-2">
          USDT Deposit amount must be greater than 0.1 USDT
        </p>
      </Card>

      {/* Estimated Payment */}
      <Card className="p-4 mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Estimated payment</span>
          <span>{amount || '0'} USDT</span>
        </div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-500">Reference rate</span>
          <span>1 USDT = 1 USDT</span>
        </div>
        <p className="text-xs text-gray-400">
          The payment amount and exchange rate are subject to the actual payment
        </p>
      </Card>

      {/* Submit Button */}
      <Button
        onClick={handleDeposit}
        className="w-full bg-[#6B0000] hover:bg-[#8B0000] py-6 text-lg"
        disabled={submitting || !amount}
      >
        {submitting ? 'Processing...' : 'Deposit now'}
      </Button>
    </div>
  );
}
