// =====================================================
// COMMISSION HISTORY API
// Returns user's referral commission earnings
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Commission rates
const COMMISSION_RATES: Record<number, number> = {
  1: 10,
  2: 5,
  3: 2,
};

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
    const level = searchParams.get('level'); // '1', '2', '3', or null for all

    const where: Record<string, unknown> = { userId: user.id };
    if (level) where.level = parseInt(level);

    // Get commissions
    const commissions = await db.referralCommission.findMany({
      where,
      include: {
        referral: {
          select: {
            id: true,
            username: true,
            vipLevel: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate totals by level
    const totals = await db.referralCommission.groupBy({
      by: ['level'],
      where: { userId: user.id },
      _sum: {
        commissionAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const levelStats = {
      1: { total: 0, count: 0, rate: 10 },
      2: { total: 0, count: 0, rate: 5 },
      3: { total: 0, count: 0, rate: 2 },
    };

    totals.forEach((t) => {
      levelStats[t.level as keyof typeof levelStats] = {
        total: t._sum.commissionAmount || 0,
        count: t._count,
        rate: COMMISSION_RATES[t.level],
      };
    });

    // Get team counts
    const teamCounts = await db.teamMember.groupBy({
      by: ['level'],
      where: { userId: user.id },
      _count: { id: true },
    });

    const teamStats = {
      1: 0,
      2: 0,
      3: 0,
    };

    teamCounts.forEach((t) => {
      teamStats[t.level as keyof typeof teamStats] = t._count.id;
    });

    return NextResponse.json({
      success: true,
      data: {
        commissions,
        levelStats,
        teamStats,
        totalCommission: user.totalCommission,
      },
    });
  } catch (error) {
    console.error('Get commission history error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
