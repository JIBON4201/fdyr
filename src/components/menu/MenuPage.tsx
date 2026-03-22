// =====================================================
// MENU PAGE COMPONENT
// Products list with VIP tiers and purchase functionality
// VIP is based on BALANCE:
// VIP 0: $1-$250 | VIP 1: $251-$800 | VIP 2: $801-$2000 | VIP 3: $2001+
// Restriction: Cannot buy same product amount within 3 days
// =====================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUserStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Product } from '@/types';
import { ShoppingCart, AlertCircle, CheckCircle, Crown, TrendingUp, Wallet, Clock } from 'lucide-react';

interface PurchaseResult {
  orderId: string;
  amount: number;
  commission: number;
  totalReturn: number;
}

interface VipInfo {
  currentLevel: number;
  balance: number;
  nextLevel: number | null;
  nextLevelRequirement: number | null;
  progress: number;
}

interface PurchaseRestriction {
  restricted: boolean;
  productName?: string;
  amount?: number;
  availableAt?: string;
  remainingHours?: number;
}

// VIP Level based on BALANCE
const VIP_INFO: Record<number, { range: string; commission: string; color: string }> = {
  0: { range: '$1 - $250', commission: '2-3%', color: 'bg-gray-500' },
  1: { range: '$251 - $800', commission: '4-5%', color: 'bg-green-500' },
  2: { range: '$801 - $2000', commission: '6-8%', color: 'bg-blue-500' },
  3: { range: '$2001+', commission: '10-12%', color: 'bg-yellow-500' },
};

export function MenuPage() {
  const { user } = useUserStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVip, setSelectedVip] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [vipInfo, setVipInfo] = useState<VipInfo | null>(null);

  // Purchase modal state
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [purchaseAmount, setPurchaseAmount] = useState('');
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState('');
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null);
  const [restriction, setRestriction] = useState<PurchaseRestriction | null>(null);

  useEffect(() => {
    fetch('/api/products/list')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProducts(Array.isArray(data.data) ? data.data : []);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts([]);
        setLoading(false);
      });

    // Fetch VIP info
    if (user) {
      fetch('/api/user/vip-info')
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setVipInfo(data.data);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // Check restriction when amount changes
  const checkRestriction = useCallback(async (amount: number) => {
    if (amount <= 0) {
      setRestriction(null);
      return;
    }

    try {
      const res = await fetch(`/api/orders/check-restriction?amount=${amount}`);
      const data = await res.json();
      if (data.success) {
        setRestriction(data.data);
      }
    } catch {
      setRestriction(null);
    }
  }, []);

  // Debounced restriction check
  useEffect(() => {
    if (!purchaseAmount) {
      setRestriction(null);
      return;
    }

    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      setRestriction(null);
      return;
    }

    const timer = setTimeout(() => {
      checkRestriction(amount);
    }, 500);

    return () => clearTimeout(timer);
  }, [purchaseAmount, checkRestriction]);

  // Only show products for user's VIP level and below
  const availableProducts = products.filter((p) => p.vipLevel <= (user?.vipLevel ?? 0));

  const filteredProducts = selectedVip === 'all'
    ? availableProducts
    : availableProducts.filter((p) => p.vipLevel === parseInt(selectedVip));

  const formatBalance = (min: number, max: number) => {
    if (max >= 99999) {
      return `≥$${min}`;
    }
    return `$${min} - $${max}`;
  };

  const openPurchaseModal = (product: Product) => {
    if (!user) {
      alert('Please login first');
      return;
    }
    setSelectedProduct(product);
    setPurchaseAmount(product.minBalance.toString());
    setPurchaseError('');
    setPurchaseResult(null);
    setRestriction(null);
    setPurchaseModalOpen(true);
  };

  const handlePurchase = async () => {
    if (!selectedProduct) return;

    const amount = parseFloat(purchaseAmount);
    if (isNaN(amount) || amount <= 0) {
      setPurchaseError('Please enter a valid amount');
      return;
    }

    if (amount < selectedProduct.minBalance || amount > selectedProduct.maxBalance) {
      setPurchaseError(`Amount must be between $${selectedProduct.minBalance} and $${selectedProduct.maxBalance >= 99999 ? '∞' : selectedProduct.maxBalance}`);
      return;
    }

    setPurchasing(true);
    setPurchaseError('');

    try {
      const res = await fetch('/api/orders/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct.id,
          amount,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPurchaseResult(data.data);
        // Refresh VIP info after purchase
        fetch('/api/user/vip-info')
          .then((res) => res.json())
          .then((vipData) => {
            if (vipData.success) {
              setVipInfo(vipData.data);
            }
          });
      } else {
        setPurchaseError(data.error || 'Purchase failed');
      }
    } catch {
      setPurchaseError('Network error. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const closePurchaseModal = () => {
    setPurchaseModalOpen(false);
    setSelectedProduct(null);
    setPurchaseAmount('');
    setPurchaseError('');
    setPurchaseResult(null);
    setRestriction(null);
  };

  const calculateCommission = () => {
    const amount = parseFloat(purchaseAmount) || 0;
    if (selectedProduct) {
      return (amount * selectedProduct.commission) / 100;
    }
    return 0;
  };

  const formatRemainingTime = (hours: number) => {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${remainingHours > 0 ? `${remainingHours}h` : ''}`;
    }
    return `${remainingHours} hour${remainingHours > 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white p-4 border-b">
        <h1 className="text-xl font-bold text-center">Menu</h1>
      </div>

      {/* User Balance & VIP Info */}
      {user && (
        <div className="bg-gradient-to-r from-[#6B0000] to-[#8B0000] text-white p-4 m-4 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <p className="text-sm opacity-80 flex items-center gap-1">
                <Wallet className="w-4 h-4" /> Your Balance
              </p>
              <p className="text-2xl font-bold">${(user.balance ?? 0).toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-80">Current VIP</p>
              <div className="flex items-center gap-1">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-2xl font-bold">VIP {user.vipLevel ?? 0}</span>
              </div>
            </div>
          </div>

          {/* VIP Progress */}
          {vipInfo && vipInfo.nextLevel && (
            <div className="bg-white/20 rounded-lg p-3 mt-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Current: ${(vipInfo.balance ?? 0).toFixed(2)}</span>
                <span>VIP {vipInfo.nextLevel} at ${vipInfo.nextLevelRequirement}</span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-yellow-400 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(vipInfo.progress ?? 0, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIP Level Explanation */}
      <div className="bg-blue-50 border border-blue-200 mx-4 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-blue-800">VIP Level (Based on Balance)</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`p-2 rounded ${user?.vipLevel === 0 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white'}`}>
            <div className="font-bold">VIP 0</div>
            <div className="text-gray-600">$1 - $250</div>
            <div className="text-green-600">2-3% commission</div>
          </div>
          <div className={`p-2 rounded ${user?.vipLevel === 1 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white'}`}>
            <div className="font-bold">VIP 1</div>
            <div className="text-gray-600">$251 - $800</div>
            <div className="text-green-600">4-5% commission</div>
          </div>
          <div className={`p-2 rounded ${user?.vipLevel === 2 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white'}`}>
            <div className="font-bold">VIP 2</div>
            <div className="text-gray-600">$801 - $2000</div>
            <div className="text-green-600">6-8% commission</div>
          </div>
          <div className={`p-2 rounded ${user?.vipLevel === 3 ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white'}`}>
            <div className="font-bold">VIP 3</div>
            <div className="text-gray-600">$2001+</div>
            <div className="text-green-600">10-12% commission</div>
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-2">💡 Add balance to unlock higher VIP levels!</p>
      </div>

      {/* VIP Tabs */}
      <div className="bg-white px-4 py-3 sticky top-0 z-10 border-b">
        <Tabs value={selectedVip} onValueChange={setSelectedVip}>
          <TabsList className="w-full grid grid-cols-5 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="all" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="0" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              VIP 0
            </TabsTrigger>
            <TabsTrigger value="1" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              VIP 1
            </TabsTrigger>
            <TabsTrigger value="2" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              VIP 2
            </TabsTrigger>
            <TabsTrigger value="3" className="data-[state=active]:bg-[#6B0000] data-[state=active]:text-white rounded-md text-xs sm:text-sm">
              VIP 3
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Products List */}
      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6B0000]"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No products available for your VIP level.</p>
            <p className="text-sm mt-2">Add balance to unlock higher VIP products!</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                {/* VIP Badge */}
                <div className="relative">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    {product.icon}
                  </div>
                  <span className={`absolute -top-1 -right-1 text-xs px-1.5 py-0.5 rounded-full font-bold text-white ${
                    product.vipLevel === 0 ? 'bg-gray-500' :
                    product.vipLevel === 1 ? 'bg-green-500' :
                    product.vipLevel === 2 ? 'bg-blue-500' :
                    'bg-yellow-500 text-black'
                  }`}>
                    VIP {product.vipLevel}
                  </span>
                </div>

                {/* Product Info */}
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-gray-500 text-sm">{formatBalance(product.minBalance, product.maxBalance)}</p>
                  <p className="text-sm mt-1">
                    <span className="text-blue-500">Commission:</span>{' '}
                    <span className="text-green-600 font-semibold">{product.commission}%</span>
                  </p>
                </div>

                {/* Buy Button */}
                <Button
                  onClick={() => openPurchaseModal(product)}
                  className="bg-[#6B0000] hover:bg-[#8B0000] text-white px-4"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Buy
                </Button>
              </div>
            </Card>
          ))
        )}

        {filteredProducts.length > 0 && (
          <p className="text-center text-gray-400 text-sm py-4">No more</p>
        )}
      </div>

      {/* Purchase Modal */}
      <Dialog open={purchaseModalOpen} onOpenChange={setPurchaseModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{purchaseResult ? 'Purchase Successful!' : `Buy ${selectedProduct?.name}`}</DialogTitle>
            <DialogDescription>
              {purchaseResult
                ? 'Your order has been completed successfully.'
                : `VIP ${selectedProduct?.vipLevel} • ${selectedProduct?.commission}% Commission`}
            </DialogDescription>
          </DialogHeader>

          {purchaseResult ? (
            <div className="py-4">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="w-16 h-16 text-green-500" />
              </div>
              <div className="space-y-3 text-center">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Amount Invested</p>
                  <p className="text-xl font-bold">${purchaseResult.amount.toFixed(2)}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Commission Earned</p>
                  <p className="text-xl font-bold text-green-600">+${purchaseResult.commission.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">Total Return</p>
                  <p className="text-xl font-bold text-blue-600">${purchaseResult.totalReturn.toFixed(2)}</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {purchaseError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <p className="text-sm">{purchaseError}</p>
                </div>
              )}

              {/* Restriction Warning */}
              {restriction?.restricted && (
                <div className="flex items-start gap-2 p-3 bg-orange-50 text-orange-700 rounded-lg mb-4 border border-orange-200">
                  <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">🔒 ${restriction.amount} is Locked</p>
                    <p className="mt-1">
                      You used ${restriction.amount} to buy "{restriction.productName}" recently.
                      This amount is locked for 3 days. Please wait <strong>{restriction.remainingHours && formatRemainingTime(restriction.remainingHours)}</strong> or use a different amount.
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Purchase Amount ($)</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={purchaseAmount}
                    onChange={(e) => setPurchaseAmount(e.target.value)}
                    placeholder="Enter amount"
                    min={selectedProduct?.minBalance}
                    max={selectedProduct?.maxBalance}
                  />
                  <p className="text-xs text-gray-500">
                    Range: {formatBalance(selectedProduct?.minBalance || 0, selectedProduct?.maxBalance || 99999)}
                  </p>
                  <p className="text-xs text-orange-600">
                    🔒 Important: Any amount you use will be locked for 3 days (cannot use same $ for any product)
                  </p>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Your Balance:</span>
                    <span className="font-medium">${(user?.balance ?? 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Commission ({selectedProduct?.commission}%):</span>
                    <span className="font-medium text-green-600">+${calculateCommission().toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">Total Return:</span>
                    <span className="font-bold text-blue-600">
                      ${((parseFloat(purchaseAmount) || 0) + calculateCommission()).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            {purchaseResult ? (
              <Button onClick={closePurchaseModal} className="w-full bg-[#6B0000] hover:bg-[#8B0000]">
                Done
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={closePurchaseModal} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={purchasing || restriction?.restricted}
                  className="flex-1 bg-[#6B0000] hover:bg-[#8B0000] disabled:opacity-50"
                >
                  {purchasing ? 'Processing...' : 'Confirm Purchase'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
