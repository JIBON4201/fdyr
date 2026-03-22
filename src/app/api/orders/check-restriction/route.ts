// =====================================================
// CHECK PURCHASE RESTRICTION API
// Checks if $amount is locked (used in any purchase in last 3 days)
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 3 days in milliseconds
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

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
    const amount = parseFloat(searchParams.get('amount') || '0');

    if (amount <= 0) {
      return NextResponse.json({
        success: true,
        data: { restricted: false },
      });
    }

    // Check if this $amount is locked (used in ANY purchase in the last 3 days)
    const threeDaysAgo = new Date(Date.now() - THREE_DAYS_MS);
    const lockedOrder = await db.order.findFirst({
      where: {
        userId: user.id,
        amount,
        createdAt: {
          gte: threeDaysAgo,
        },
      },
      include: {
        product: {
          select: { name: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (lockedOrder) {
      const availableAt = new Date(lockedOrder.createdAt.getTime() + THREE_DAYS_MS);
      const remainingMs = availableAt.getTime() - Date.now();
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));

      return NextResponse.json({
        success: true,
        data: {
          restricted: true,
          amount: lockedOrder.amount,
          productName: lockedOrder.product.name,
          purchasedAt: lockedOrder.createdAt.toISOString(),
          availableAt: availableAt.toISOString(),
          remainingHours,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: { restricted: false },
    });
  } catch (error) {
    console.error('Check restriction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
