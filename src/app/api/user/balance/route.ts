// =====================================================
// USER BALANCE API
// Returns current user balance
// =====================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get fresh balance
    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: { balance: true, vipLevel: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        balance: fullUser?.balance || 0,
        vipLevel: fullUser?.vipLevel || 0,
      },
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
