// =====================================================
// ADMIN PANEL PAGE
// Full admin dashboard with all management features
// =====================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Users, ShoppingBag, ArrowUpDown, MapPin, MessageSquare, Settings,
  LogOut, Shield, Plus, Edit, Trash2, Check, X, Eye, Copy, RefreshCw,
  TrendingUp, TrendingDown, DollarSign, UserCheck, Key
} from 'lucide-react';

// =====================================================
// TYPES
// =====================================================
interface AdminStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalBalance: number;
}

interface User {
  id: string;
  username: string;
  balance: number;
  vipLevel: number;
  inviteCode: string;
  status: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  icon: string;
  vipLevel: number;
  minBalance: number;
  maxBalance: number;
  commission: number;
  isActive: boolean;
  order: number;
}

interface Transaction {
  id: string;
  userId: string;
  user?: User;
  type: string;
  amount: number;
  status: string;
  address?: string;
  protocol?: string;
  adminNote?: string;
  createdAt: string;
}

interface DepositAddress {
  id: string;
  address: string;
  protocol: string;
  isActive: boolean;
}

interface Message {
  id: string;
  type: string;
  title: string;
  content: string;
  isActive: boolean;
}

interface InviteCode {
  id: string;
  code: string;
  isUsed: boolean;
  usedBy?: string;
}

interface AppSettings {
  customer_service_hours?: string;
  customer_service_link?: string;
  customer_service_message?: string;
  help_message?: string;
  platform_intro?: string;
}

// =====================================================
// ADMIN LOGIN COMPONENT
// =====================================================
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });

      const data = await res.json();

      if (data.success) {
        onLogin();
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#6B0000] to-[#8B0000] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#6B0000] rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Secure login required</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter admin username"
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="mt-1"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full bg-[#6B0000] hover:bg-[#8B0000]"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-6">
          Default: admin / admin123
        </p>
      </Card>
    </div>
  );
}

// =====================================================
// STATS DASHBOARD
// =====================================================
function StatsDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-500' },
    { label: 'Total Deposits', value: `$${stats?.totalDeposits?.toFixed(2) || '0'}`, icon: TrendingUp, color: 'text-green-500' },
    { label: 'Total Withdrawals', value: `$${stats?.totalWithdrawals?.toFixed(2) || '0'}`, icon: TrendingDown, color: 'text-red-500' },
    { label: 'Pending Deposits', value: stats?.pendingDeposits || 0, icon: DollarSign, color: 'text-yellow-500' },
    { label: 'Pending Withdrawals', value: stats?.pendingWithdrawals || 0, icon: ArrowUpDown, color: 'text-orange-500' },
    { label: 'Total User Balance', value: `$${stats?.totalBalance?.toFixed(2) || '0'}`, icon: DollarSign, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Dashboard Overview</h2>
        <Button variant="outline" size="sm" onClick={fetchStats}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gray-100 ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// USERS MANAGEMENT
// =====================================================
function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/users', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.data.users || []);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to fetch users:', error);
        setUsers([]);
        setLoading(false);
      });
  }, []);

  const toggleStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Users Management</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left p-3 text-sm font-medium">Username</th>
              <th className="text-left p-3 text-sm font-medium">Balance</th>
              <th className="text-left p-3 text-sm font-medium">VIP</th>
              <th className="text-left p-3 text-sm font-medium">Invite Code</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-left p-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{user.username}</td>
                <td className="p-3">{user.balance.toFixed(2)} USDT</td>
                <td className="p-3">
                  <Badge variant="outline">VIP {user.vipLevel}</Badge>
                </td>
                <td className="p-3 font-mono text-sm">{user.inviteCode}</td>
                <td className="p-3">
                  <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                    {user.status}
                  </Badge>
                </td>
                <td className="p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(user.id, user.status)}
                  >
                    {user.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// =====================================================
// PRODUCTS MANAGEMENT
// =====================================================
function ProductsManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/products', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(Array.isArray(data.data) ? data.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE',
        credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setProducts(products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const toggleActive = async (product: Product) => {
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: product.id, isActive: !product.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        setProducts(products.map(p => p.id === product.id ? { ...p, isActive: !p.isActive } : p));
      }
    } catch (error) {
      console.error('Failed to update product:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Products Management</h2>
        <Button onClick={() => setShowAddForm(true)} className="bg-[#6B0000] hover:bg-[#8B0000]">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Add/Edit Product Form */}
      {(showAddForm || editingProduct) && (
        <ProductForm
          product={editingProduct}
          onSave={async (productData) => {
            try {
              const url = '/api/admin/products';
              const method = editingProduct ? 'PUT' : 'POST';
              const body = editingProduct ? { ...productData, id: editingProduct.id } : productData;

              const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
              });

              const data = await res.json();
              if (data.success) {
                fetchProducts();
                setShowAddForm(false);
                setEditingProduct(null);
              }
            } catch (error) {
              console.error('Failed to save product:', error);
            }
          }}
          onCancel={() => {
            setShowAddForm(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Products List */}
      <div className="grid gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{product.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold">{product.name}</h3>
                    <Badge>VIP {product.vipLevel}</Badge>
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    Balance: {product.minBalance} - {product.maxBalance >= 99999 ? '∞' : product.maxBalance} USDT
                  </p>
                  <p className="text-sm text-green-500">Commission: {product.commission}%</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleActive(product)}>
                  {product.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Product Form Component
function ProductForm({ 
  product, 
  onSave, 
  onCancel 
}: { 
  product: Product | null; 
  onSave: (data: Partial<Product>) => void; 
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    icon: product?.icon || '🛒',
    vipLevel: product?.vipLevel || 1,
    minBalance: product?.minBalance || 20,
    maxBalance: product?.maxBalance || 498,
    commission: product?.commission || 4,
    order: product?.order || 0,
  });

  return (
    <Card className="p-4 mb-4">
      <h3 className="font-bold mb-4">{product ? 'Edit Product' : 'Add New Product'}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Name</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Product name"
          />
        </div>
        <div>
          <Label>Icon (Emoji)</Label>
          <Input
            value={formData.icon}
            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
            placeholder="🛒"
          />
        </div>
        <div>
          <Label>VIP Level</Label>
          <Input
            type="number"
            value={formData.vipLevel}
            onChange={(e) => setFormData({ ...formData, vipLevel: parseInt(e.target.value) })}
            min={1}
            max={3}
          />
        </div>
        <div>
          <Label>Commission (%)</Label>
          <Input
            type="number"
            value={formData.commission}
            onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <Label>Min Balance</Label>
          <Input
            type="number"
            value={formData.minBalance}
            onChange={(e) => setFormData({ ...formData, minBalance: parseFloat(e.target.value) })}
          />
        </div>
        <div>
          <Label>Max Balance</Label>
          <Input
            type="number"
            value={formData.maxBalance}
            onChange={(e) => setFormData({ ...formData, maxBalance: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(formData)} className="bg-[#6B0000] hover:bg-[#8B0000]">
          Save
        </Button>
      </div>
    </Card>
  );
}

// =====================================================
// TRANSACTIONS MANAGEMENT
// =====================================================
function TransactionsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdraw'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/transactions', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateStatus = async (id: string, status: string, note?: string) => {
    try {
      const res = await fetch('/api/admin/transactions', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, adminNote: note }),
      });

      const data = await res.json();
      if (data.success) {
        fetchTransactions();
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
    }
  };

  const filteredTransactions = transactions.filter(t => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    return true;
  });

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold">Transactions Management</h2>
        <div className="flex gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="border rounded px-3 py-1"
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdraw">Withdrawals</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="border rounded px-3 py-1"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center text-gray-500">No transactions found</Card>
        ) : (
          filteredTransactions.map((tx) => (
            <Card key={tx.id} className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-full ${
                    tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {tx.type === 'deposit' ? (
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{tx.type.toUpperCase()}</span>
                      <Badge variant={
                        tx.status === 'approved' ? 'default' :
                        tx.status === 'rejected' ? 'destructive' : 'secondary'
                      }>
                        {tx.status}
                      </Badge>
                    </div>
                    <p className="text-lg font-bold">{tx.amount} USDT</p>
                    <p className="text-sm text-gray-500">User: {tx.user?.username || tx.userId}</p>
                    {tx.address && (
                      <p className="text-xs text-gray-400 font-mono truncate max-w-xs">
                        {tx.protocol}: {tx.address}
                      </p>
                    )}
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                {tx.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => updateStatus(tx.id, 'approved')}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => updateStatus(tx.id, 'rejected')}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

// =====================================================
// DEPOSIT ADDRESSES MANAGEMENT
// =====================================================
function AddressesManagement() {
  const [addresses, setAddresses] = useState<DepositAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newProtocol, setNewProtocol] = useState('TRC-20');

  const fetchAddresses = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/addresses', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleAdd = async () => {
    if (!newAddress.trim()) return;

    try {
      const res = await fetch('/api/admin/addresses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: newAddress, protocol: newProtocol }),
      });

      const data = await res.json();
      if (data.success) {
        fetchAddresses();
        setNewAddress('');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to add address:', error);
    }
  };

  const toggleActive = async (address: DepositAddress) => {
    try {
      const res = await fetch('/api/admin/addresses', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: address.id, isActive: !address.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        setAddresses(addresses.map(a => a.id === address.id ? { ...a, isActive: !a.isActive } : a));
      }
    } catch (error) {
      console.error('Failed to update address:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;

    try {
      const res = await fetch(`/api/admin/addresses?id=${id}`, { method: 'DELETE',
        credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAddresses(addresses.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete address:', error);
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Deposit Addresses</h2>
        <Button onClick={() => setShowAddForm(true)} className="bg-[#6B0000] hover:bg-[#8B0000]">
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Add Address Form */}
      {showAddForm && (
        <Card className="p-4">
          <h3 className="font-bold mb-4">Add New Deposit Address</h3>
          <div className="space-y-4">
            <div>
              <Label>Protocol</Label>
              <select
                value={newProtocol}
                onChange={(e) => setNewProtocol(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="TRC-20">TRC-20</option>
                <option value="ERC-20">ERC-20</option>
                <option value="BEP-20">BEP-20</option>
              </select>
            </div>
            <div>
              <Label>Wallet Address</Label>
              <Input
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="Enter wallet address"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button onClick={handleAdd} className="bg-[#6B0000] hover:bg-[#8B0000]">Add</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Addresses List */}
      <div className="space-y-4">
        {addresses.map((address) => (
          <Card key={address.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline">{address.protocol}</Badge>
                <div>
                  <p className="font-mono text-sm break-all">{address.address}</p>
                  <Badge variant={address.isActive ? 'default' : 'secondary'} className="mt-1">
                    {address.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => copyAddress(address.address)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => toggleActive(address)}>
                  {address.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(address.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// MESSAGES MANAGEMENT
// =====================================================
function MessagesManagement() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [formData, setFormData] = useState({
    type: 'announcement',
    title: '',
    content: '',
  });

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/messages', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSubmit = async () => {
    try {
      const url = '/api/admin/messages';
      const method = editingMessage ? 'PUT' : 'POST';
      const body = editingMessage ? { ...formData, id: editingMessage.id } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        fetchMessages();
        setShowAddForm(false);
        setEditingMessage(null);
        setFormData({ type: 'announcement', title: '', content: '' });
      }
    } catch (error) {
      console.error('Failed to save message:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      const res = await fetch(`/api/admin/messages?id=${id}`, { method: 'DELETE',
        credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setMessages(messages.filter(m => m.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const toggleActive = async (message: Message) => {
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: message.id, isActive: !message.isActive }),
      });

      const data = await res.json();
      if (data.success) {
        setMessages(messages.map(m => m.id === message.id ? { ...m, isActive: !m.isActive } : m));
      }
    } catch (error) {
      console.error('Failed to update message:', error);
    }
  };

  const editMessage = (message: Message) => {
    setEditingMessage(message);
    setFormData({
      type: message.type,
      title: message.title,
      content: message.content,
    });
    setShowAddForm(true);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Customer Service Messages</h2>
        <Button 
          onClick={() => {
            setShowAddForm(true);
            setEditingMessage(null);
            setFormData({ type: 'announcement', title: '', content: '' });
          }} 
          className="bg-[#6B0000] hover:bg-[#8B0000]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Message
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="p-4">
          <h3 className="font-bold mb-4">{editingMessage ? 'Edit Message' : 'Add New Message'}</h3>
          <div className="space-y-4">
            <div>
              <Label>Type</Label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full border rounded px-3 py-2 mt-1"
              >
                <option value="announcement">Announcement</option>
                <option value="notification">Notification</option>
                <option value="activity">Activity</option>
              </select>
            </div>
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Message title"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Content</Label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Message content"
                className="w-full border rounded px-3 py-2 mt-1 min-h-[100px]"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setShowAddForm(false);
                setEditingMessage(null);
              }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="bg-[#6B0000] hover:bg-[#8B0000]">
                Save
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Messages List */}
      <div className="space-y-4">
        {messages.map((message) => (
          <Card key={message.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{message.type}</Badge>
                  <Badge variant={message.isActive ? 'default' : 'secondary'}>
                    {message.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <h3 className="font-bold">{message.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{message.content}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggleActive(message)}>
                  {message.isActive ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="sm" onClick={() => editMessage(message)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(message.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// SETTINGS MANAGEMENT
// =====================================================
function SettingsManagement() {
  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings/customer-service')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSettings(data.data);
        }
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (data.success) {
        alert('Settings saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Customer Service Settings</h2>

      <Card className="p-4">
        <div className="space-y-4">
          <div>
            <Label>Service Hours</Label>
            <Input
              value={settings.customer_service_hours || ''}
              onChange={(e) => setSettings({ ...settings, customer_service_hours: e.target.value })}
              placeholder="e.g., 07:00-23:00 (UK)"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Customer Service Link</Label>
            <Input
              value={settings.customer_service_link || 'https://t.me/Customerservice1541'}
              onChange={(e) => setSettings({ ...settings, customer_service_link: e.target.value })}
              placeholder="https://t.me/Customerservice1541"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Customer Service Button Text</Label>
            <Input
              value={settings.customer_service_message || ''}
              onChange={(e) => setSettings({ ...settings, customer_service_message: e.target.value })}
              placeholder="e.g., Online customer service"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Help Message</Label>
            <textarea
              value={settings.help_message || ''}
              onChange={(e) => setSettings({ ...settings, help_message: e.target.value })}
              placeholder="Help message for users"
              className="w-full border rounded px-3 py-2 mt-1 min-h-[80px]"
            />
          </div>

          <div>
            <Label>Platform Introduction</Label>
            <textarea
              value={settings.platform_intro || ''}
              onChange={(e) => setSettings({ ...settings, platform_intro: e.target.value })}
              placeholder="Platform introduction text"
              className="w-full border rounded px-3 py-2 mt-1 min-h-[80px]"
            />
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-[#6B0000] hover:bg-[#8B0000]"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </div>
  );
}

// =====================================================
// INVITE CODES MANAGEMENT
// =====================================================
function InviteCodesManagement() {
  const [codes, setCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCodeCount, setNewCodeCount] = useState(5);

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/invite-codes', { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        // API returns { inviteCodes: [...] } in data.data
        setCodes(data.data?.inviteCodes || data.data || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const generateCodes = async () => {
    try {
      const res = await fetch('/api/admin/invite-codes', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: newCodeCount }),
      });

      const data = await res.json();
      if (data.success) {
        fetchCodes();
      }
    } catch (error) {
      console.error('Failed to generate codes:', error);
    }
  };

  const deleteCode = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/invite-codes?id=${id}`, { method: 'DELETE',
        credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setCodes(codes.filter(c => c.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete code:', error);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  if (loading) {
    return <div className="flex justify-center p-8"><RefreshCw className="w-6 h-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-bold">Invite Codes</h2>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            value={newCodeCount}
            onChange={(e) => setNewCodeCount(parseInt(e.target.value) || 1)}
            className="w-20"
            min={1}
            max={50}
          />
          <Button onClick={generateCodes} className="bg-[#6B0000] hover:bg-[#8B0000]">
            <Key className="w-4 h-4 mr-2" />
            Generate
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{codes.length}</p>
          <p className="text-sm text-gray-500">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-500">{codes.filter(c => !c.isUsed).length}</p>
          <p className="text-sm text-gray-500">Available</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-red-500">{codes.filter(c => c.isUsed).length}</p>
          <p className="text-sm text-gray-500">Used</p>
        </Card>
      </div>

      {/* Codes List */}
      <div className="grid gap-2">
        {codes.map((code) => (
          <Card key={code.id} className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <code className="font-mono text-lg font-bold">{code.code}</code>
                <Badge variant={code.isUsed ? 'destructive' : 'default'}>
                  {code.isUsed ? 'Used' : 'Available'}
                </Badge>
              </div>
              <div className="flex gap-2">
                {!code.isUsed && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => copyCode(code.code)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => deleteCode(code.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// =====================================================
// MAIN ADMIN PAGE COMPONENT
// =====================================================
export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const router = useRouter();

  // Check if admin is logged in
  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((res) => {
        if (res.ok) {
          setIsLoggedIn(true);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setIsLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { 
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Admin logout error:', error);
    }
    
    // Clear local state
    setIsLoggedIn(false);
    
    // Force page reload to clear any cached data
    window.location.href = '/admin';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <RefreshCw className="w-8 h-8 animate-spin text-[#6B0000]" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Admin Header */}
      <header className="bg-[#6B0000] text-white p-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push('/')}
              className="text-white border-white hover:bg-white/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Site
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="text-white border-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4 md:grid-cols-8 bg-white mb-6 p-1 rounded-lg">
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden md:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span className="hidden md:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden md:inline">Products</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-1">
              <ArrowUpDown className="w-4 h-4" />
              <span className="hidden md:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="hidden md:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden md:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="codes" className="flex items-center gap-1">
              <Key className="w-4 h-4" />
              <span className="hidden md:inline">Codes</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <Settings className="w-4 h-4" />
              <span className="hidden md:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="bg-white rounded-lg p-6">
            <StatsDashboard />
          </TabsContent>

          <TabsContent value="users" className="bg-white rounded-lg p-6">
            <UsersManagement />
          </TabsContent>

          <TabsContent value="products" className="bg-white rounded-lg p-6">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="transactions" className="bg-white rounded-lg p-6">
            <TransactionsManagement />
          </TabsContent>

          <TabsContent value="addresses" className="bg-white rounded-lg p-6">
            <AddressesManagement />
          </TabsContent>

          <TabsContent value="messages" className="bg-white rounded-lg p-6">
            <MessagesManagement />
          </TabsContent>

          <TabsContent value="codes" className="bg-white rounded-lg p-6">
            <InviteCodesManagement />
          </TabsContent>

          <TabsContent value="settings" className="bg-white rounded-lg p-6">
            <SettingsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
