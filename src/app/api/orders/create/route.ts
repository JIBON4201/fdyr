// =====================================================
// ORDER CREATE API
// Handles product purchases for users
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId, amount } = body;

    if (!productId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Product ID and valid amount are required' },
        { status: 400 }
      );
    }

    // Get product details
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return NextResponse.json(
        { success: false, error: 'Product not found or inactive' },
        { status: 404 }
      );
    }

    // Check if user's balance meets minimum requirement
    if (user.balance < product.minBalance) {
      return NextResponse.json(
        { success: false, error: `Minimum balance required: ${product.minBalance} USDT` },
        { status: 400 }
      );
    }

    // Check if user's VIP level matches
    if (user.vipLevel < product.vipLevel) {
      return NextResponse.json(
        { success: false, error: `This product requires VIP ${product.vipLevel}` },
        { status: 400 }
      );
    }

    // Create order and update balance in a transaction
    const commissionAmount = amount * (product.commission / 100);
    
    const result = await db.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          amount,
          commission: commissionAmount,
          status: 'completed',
        },
      });

      // Update user balance (add commission)
      await tx.user.update({
        where: { id: user.id },
        data: {
          balance: { increment: commissionAmount },
        },
      });

      return order;
    });

    return NextResponse.json({
      success: true,
      message: 'Order completed successfully!',
      data: {
        orderId: result.id,
        amount,
        commission: commissionAmount,
        newBalance: user.balance + commissionAmount,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
