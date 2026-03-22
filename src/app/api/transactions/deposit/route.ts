// =====================================================
// DEPOSIT API
// Handles user deposit requests
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
    const { amount, protocol } = body;

    if (!amount || amount < 0.1) {
      return NextResponse.json(
        { success: false, error: 'Minimum deposit amount is 0.1 USDT' },
        { status: 400 }
      );
    }

    // Get active deposit address for the protocol
    const depositAddress = await db.depositAddress.findFirst({
      where: {
        protocol: protocol || 'TRC-20',
        isActive: true,
      },
    });

    if (!depositAddress) {
      return NextResponse.json(
        { success: false, error: 'No deposit address available for this protocol' },
        { status: 400 }
      );
    }

    // Create pending deposit transaction
    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        type: 'deposit',
        amount,
        status: 'pending',
        address: depositAddress.address,
        protocol: depositAddress.protocol,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit request submitted successfully',
      data: {
        transactionId: transaction.id,
        amount,
        address: depositAddress.address,
        protocol: depositAddress.protocol,
      },
    });
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
