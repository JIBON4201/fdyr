// =====================================================
// TEAMS API
// Returns user's team/referral information with commissions
// Level 1: 10% commission on first deposit
// Level 2: 5% commission on first deposit
// Level 3: 2% commission on first deposit
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

// Commission rates
const COMMISSION_RATES = {
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
    const level = searchParams.get('level'); // '1', '2', '3'

    // Get all team members with their levels
    const teamMembers = await db.teamMember.findMany({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            balance: true,
            firstDepositMade: true,
            createdAt: true,
          },
        },
      },
    });

    // Group by level
    const level1 = teamMembers.filter(m => m.level === 1);
    const level2 = teamMembers.filter(m => m.level === 2);
    const level3 = teamMembers.filter(m => m.level === 3);

    // Get commission statistics
    const commissions = await db.referralCommission.findMany({
      where: { userId: user.id },
      include: {
        referral: {
          select: { username: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate total commission earned
    const totalCommission = commissions.reduce((sum, c) => sum + c.commissionAmount, 0);

    // Commission by level
    const commissionByLevel = {
      1: commissions.filter(c => c.level === 1).reduce((sum, c) => sum + c.commissionAmount, 0),
      2: commissions.filter(c => c.level === 2).reduce((sum, c) => sum + c.commissionAmount, 0),
      3: commissions.filter(c => c.level === 3).reduce((sum, c) => sum + c.commissionAmount, 0),
    };

    // Get total deposits from team members
    const teamUserIds = teamMembers.map(m => m.referralId);
    
    const teamDeposits = await db.transaction.aggregate({
      where: {
        userId: { in: teamUserIds },
        type: 'deposit',
        status: 'approved',
      },
      _sum: { amount: true },
    });

    const teamWithdrawals = await db.transaction.aggregate({
      where: {
        userId: { in: teamUserIds },
        type: 'withdraw',
        status: 'approved',
      },
      _sum: { amount: true },
    });

    // Filter referrals by level for display
    let filteredMembers = level1;
    if (level === '2') filteredMembers = level2;
    else if (level === '3') filteredMembers = level3;

    // Format referrals for display
    const referrals = filteredMembers.map(m => ({
      id: m.id,
      username: m.user.username,
      balance: m.user.balance,
      firstDepositMade: m.user.firstDepositMade,
      createdAt: m.user.createdAt,
      level: m.level,
    }));

    // Get user's total commission from User model
    const userData = await db.user.findUnique({
      where: { id: user.id },
      select: { totalCommission: true },
    });

    return NextResponse.json({
      success: true,
      data: {
        teamAmount: teamMembers.length,
        level1Count: level1.length,
        level2Count: level2.length,
        level3Count: level3.length,
        totalDeposits: teamDeposits._sum.amount || 0,
        totalWithdrawals: teamWithdrawals._sum.amount || 0,
        totalCommission: userData?.totalCommission || 0,
        commissionByLevel,
        commissionRate: COMMISSION_RATES,
        commissions: commissions.slice(0, 20), // Recent 20 commissions
        referrals,
      },
    });
  } catch (error) {
    console.error('Get teams error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
