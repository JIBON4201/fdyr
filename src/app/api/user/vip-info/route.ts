// =====================================================
// VIP INFO API
// Returns user's VIP level progress and information
// VIP is based on BALANCE, not deposits
// =====================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// VIP Level based on BALANCE
// VIP 0: $1 - $250
// VIP 1: $251 - $800
// VIP 2: $801 - $2000
// VIP 3: $2001+

const VIP_RANGES = {
  VIP_0_MAX: 250,
  VIP_1_MAX: 800,
  VIP_2_MAX: 2000,
};

// Calculate VIP level based on balance
function calculateVipLevel(balance: number): number {
  if (balance > VIP_RANGES.VIP_2_MAX) return 3;
  if (balance > VIP_RANGES.VIP_1_MAX) return 2;
  if (balance > VIP_RANGES.VIP_0_MAX) return 1;
  return 0;
}

// Get next level info
function getNextLevelInfo(balance: number): { nextLevel: number | null; nextLevelRequirement: number | null; progress: number } {
  if (balance <= VIP_RANGES.VIP_0_MAX) {
    // Currently VIP 0, need to reach $251 for VIP 1
    return {
      nextLevel: 1,
      nextLevelRequirement: VIP_RANGES.VIP_0_MAX + 1,
      progress: (balance / (VIP_RANGES.VIP_0_MAX + 1)) * 100,
    };
  }
  if (balance <= VIP_RANGES.VIP_1_MAX) {
    // Currently VIP 1, need to reach $801 for VIP 2
    const rangeStart = VIP_RANGES.VIP_0_MAX + 1;
    const rangeEnd = VIP_RANGES.VIP_1_MAX + 1;
    return {
      nextLevel: 2,
      nextLevelRequirement: VIP_RANGES.VIP_1_MAX + 1,
      progress: ((balance - rangeStart) / (rangeEnd - rangeStart)) * 100,
    };
  }
  if (balance <= VIP_RANGES.VIP_2_MAX) {
    // Currently VIP 2, need to reach $2001 for VIP 3
    const rangeStart = VIP_RANGES.VIP_1_MAX + 1;
    const rangeEnd = VIP_RANGES.VIP_2_MAX + 1;
    return {
      nextLevel: 3,
      nextLevelRequirement: VIP_RANGES.VIP_2_MAX + 1,
      progress: ((balance - rangeStart) / (rangeEnd - rangeStart)) * 100,
    };
  }
  // Already VIP 3
  return {
    nextLevel: null,
    nextLevelRequirement: null,
    progress: 100,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const balance = user.balance;
    const correctVipLevel = calculateVipLevel(balance);

    // Update VIP level if it's incorrect
    if (user.vipLevel !== correctVipLevel) {
      await db.user.update({
        where: { id: user.id },
        data: { vipLevel: correctVipLevel },
      });
    }

    const nextLevelInfo = getNextLevelInfo(balance);

    return NextResponse.json({
      success: true,
      data: {
        currentLevel: correctVipLevel,
        balance,
        nextLevel: nextLevelInfo.nextLevel,
        nextLevelRequirement: nextLevelInfo.nextLevelRequirement,
        progress: Math.min(nextLevelInfo.progress, 100),
      },
    });
  } catch (error) {
    console.error('Get VIP info error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
