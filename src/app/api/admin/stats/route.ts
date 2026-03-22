// =====================================================
// ADMIN STATS API
// Returns dashboard statistics for admin panel
// =====================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  try {
    // Check admin authentication
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get statistics
    const totalUsers = await db.user.count({
      where: { isAdmin: false },
    });

    const totalDeposits = await db.transaction.aggregate({
      where: { type: 'deposit', status: 'approved' },
      _sum: { amount: true },
    });

    const totalWithdrawals = await db.transaction.aggregate({
      where: { type: 'withdraw', status: 'approved' },
      _sum: { amount: true },
    });

    const pendingDeposits = await db.transaction.count({
      where: { type: 'deposit', status: 'pending' },
    });

    const pendingWithdrawals = await db.transaction.count({
      where: { type: 'withdraw', status: 'pending' },
    });

    const totalBalance = await db.user.aggregate({
      where: { isAdmin: false },
      _sum: { balance: true },
    });

    const activeProducts = await db.product.count({
      where: { isActive: true },
    });

    const totalOrders = await db.order.count();

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalDeposits: totalDeposits._sum.amount || 0,
        totalWithdrawals: totalWithdrawals._sum.amount || 0,
        pendingDeposits,
        pendingWithdrawals,
        totalBalance: totalBalance._sum.balance || 0,
        activeProducts,
        totalOrders,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
