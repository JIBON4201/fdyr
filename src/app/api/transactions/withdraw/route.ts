// =====================================================
// WITHDRAW API
// Handles user withdrawal requests
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
    const { amount, walletId } = body;

    if (!amount || amount < 1) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal amount is 1 USDT' },
        { status: 400 }
      );
    }

    // Get user's balance
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
    });

    if (!fullUser || fullUser.balance < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient balance' },
        { status: 400 }
      );
    }

    // Get wallet
    const wallet = await db.wallet.findFirst({
      where: {
        id: walletId,
        userId: user.id,
        isActive: true,
      },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Please bind a wallet address first' },
        { status: 400 }
      );
    }

    // Create pending withdrawal transaction
    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        type: 'withdraw',
        amount,
        status: 'pending',
        address: wallet.address,
        protocol: wallet.protocol,
      },
    });

    // Deduct balance immediately (will be refunded if rejected)
    await db.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: amount,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      data: {
        transactionId: transaction.id,
        amount,
      },
    });
  } catch (error) {
    console.error('Withdraw error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
