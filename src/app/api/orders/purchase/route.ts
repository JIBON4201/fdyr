// =====================================================
// ORDER PURCHASE API
// Handles product purchases and commission earnings
// Restriction: When user buys with $X, that $X is locked for 3 days
// (Cannot buy ANY product with the same amount for 3 days)
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// 3 days in milliseconds
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

// POST - Purchase a product
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Please login first' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, amount } = body;

    if (!productId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid product or amount' },
        { status: 400 }
      );
    }

    // Get the product
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: 'Product not available' },
        { status: 404 }
      );
    }

    // Validate amount is within product limits
    if (amount < product.minBalance || amount > product.maxBalance) {
      return NextResponse.json(
        { success: false, error: `Amount must be between ${product.minBalance} and ${product.maxBalance} USDT` },
        { status: 400 }
      );
    }

    // Check user VIP level (user can only buy products at their VIP level or lower)
    if (user.vipLevel < product.vipLevel) {
      return NextResponse.json(
        { success: false, error: `You need VIP ${product.vipLevel} to purchase this product` },
        { status: 400 }
      );
    }

    // Check user balance
    if (user.balance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Check if this $amount is locked (user purchased ANY product with this amount in the last 3 days)
    const threeDaysAgo = new Date(Date.now() - THREE_DAYS_MS);
    const lockedOrder = await db.order.findFirst({
      where: {
        userId: user.id,
        amount: amount,
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
      // Calculate remaining time
      const availableAt = new Date(lockedOrder.createdAt.getTime() + THREE_DAYS_MS);
      const remainingMs = availableAt.getTime() - Date.now();
      const remainingHours = Math.ceil(remainingMs / (1000 * 60 * 60));
      const remainingDays = Math.floor(remainingHours / 24);
      const leftoverHours = remainingHours % 24;

      let timeMessage = '';
      if (remainingDays > 0) {
        timeMessage = `${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
        if (leftoverHours > 0) {
          timeMessage += ` and ${leftoverHours} hour${leftoverHours > 1 ? 's' : ''}`;
        }
      } else {
        timeMessage = `${leftoverHours} hour${leftoverHours > 1 ? 's' : ''}`;
      }

      return NextResponse.json(
        {
          success: false,
          error: `$${amount} is locked. You purchased "${lockedOrder.product.name}" for $${amount} recently. Please wait ${timeMessage} before using $${amount} again.`,
          restriction: {
            amount,
            productName: lockedOrder.product.name,
            purchasedAt: lockedOrder.createdAt.toISOString(),
            availableAt: availableAt.toISOString(),
            remainingHours,
          },
        },
        { status: 400 }
      );
    }

    // Calculate commission
    const commissionAmount = (amount * product.commission) / 100;
    const totalReturn = amount + commissionAmount;

    // Create order and update user balance in a transaction
    const order = await db.$transaction(async (tx) => {
      // Deduct the purchase amount from user balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            decrement: amount,
          },
        },
      });

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          amount,
          commission: commissionAmount,
          status: 'completed',
        },
      });

      // Add commission to user balance
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: totalReturn,
          },
        },
      });

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      message: 'Purchase successful!',
      data: {
        orderId: order.id,
        amount,
        commission: commissionAmount,
        totalReturn,
        lockedUntil: new Date(Date.now() + THREE_DAYS_MS).toISOString(),
      },
    });
  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
