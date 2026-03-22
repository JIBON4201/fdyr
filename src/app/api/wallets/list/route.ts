// =====================================================
// WALLETS API
// Handles user wallet address management
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// GET - List user's wallets
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const wallets = await db.wallet.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: wallets,
    });
  } catch (error) {
    console.error('Get wallets error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Add new wallet
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
    const { address, protocol } = body;

    if (!address || !protocol) {
      return NextResponse.json(
        { success: false, error: 'Address and protocol are required' },
        { status: 400 }
      );
    }

    // Check if wallet already exists
    const existingWallet = await db.wallet.findFirst({
      where: {
        userId: user.id,
        address,
      },
    });

    if (existingWallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet address already exists' },
        { status: 400 }
      );
    }

    const wallet = await db.wallet.create({
      data: {
        userId: user.id,
        address,
        protocol,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Wallet added successfully',
      data: wallet,
    });
  } catch (error) {
    console.error('Add wallet error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete wallet
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Wallet ID is required' },
        { status: 400 }
      );
    }

    await db.wallet.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Wallet deleted successfully',
    });
  } catch (error) {
    console.error('Delete wallet error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
