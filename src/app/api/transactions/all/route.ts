// =====================================================
// ALL TRANSACTIONS API
// Returns combined list of orders, deposits, and withdrawals
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const transactions: Array<{
      id: string;
      type: string;
      amount: number;
      status: string;
      commission?: number;
      productName?: string;
      productIcon?: string;
      address?: string | null;
      protocol?: string | null;
      adminNote?: string | null;
      createdAt: Date;
    }> = [];

    // Fetch orders (purchases)
    if (type === 'all' || type === 'purchase') {
      const orders = await db.order.findMany({
        where: { userId: user.id },
        include: {
          product: {
            select: { name: true, icon: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      for (const order of orders) {
        transactions.push({
          id: order.id,
          type: 'purchase',
          amount: order.amount,
          status: order.status,
          commission: order.commission,
          productName: order.product.name,
          productIcon: order.product.icon,
          createdAt: order.createdAt,
        });
      }
    }

    // Fetch transactions (deposits and withdrawals)
    if (type === 'all' || type === 'deposit' || type === 'withdraw') {
      const where: Record<string, unknown> = { userId: user.id };
      if (type !== 'all') {
        where.type = type;
      }

      const dbTransactions = await db.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      for (const tx of dbTransactions) {
        transactions.push({
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          status: tx.status,
          address: tx.address,
          protocol: tx.protocol,
          adminNote: tx.adminNote,
          createdAt: tx.createdAt,
        });
      }
    }

    // Sort all transactions by date (newest first)
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate
    const total = transactions.length;
    const paginatedTransactions = transactions.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: paginatedTransactions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
