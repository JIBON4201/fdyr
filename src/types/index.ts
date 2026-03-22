// =====================================================
// TYPE DEFINITIONS FOR THE APPLICATION
// =====================================================

// User types
export interface User {
  id: string;
  username: string;
  balance: number;
  vipLevel: number;
  inviteCode: string;
  referrerId: string | null;
  status: string;
  isAdmin: boolean;
  firstDepositMade: boolean;
  totalCommission: number;
  createdAt: string;
  updatedAt: string;
}

// Product types
export interface Product {
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

// Transaction types
export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  address: string | null;
  protocol: string | null;
  adminNote: string | null;
  createdAt: string;
  updatedAt: string;
}

// Deposit Address types
export interface DepositAddress {
  id: string;
  address: string;
  protocol: string;
  isActive: boolean;
}

// Wallet types
export interface Wallet {
  id: string;
  userId: string;
  address: string;
  protocol: string;
  isActive: boolean;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  productId: string;
  product?: Product;
  amount: number;
  commission: number;
  status: 'pending' | 'completed';
  createdAt: string;
}

// Team Member types
export interface TeamMember {
  id: string;
  userId: string;
  referralId: string;
  level: number;
  createdAt: string;
}

// Message types
export interface Message {
  id: string;
  type: 'announcement' | 'notification' | 'activity';
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

// Settings types
export interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Auth types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  password: string;
  confirmPassword: string;
  inviteCode: string;
}

// Dashboard stats
export interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  totalBalance: number;
}
