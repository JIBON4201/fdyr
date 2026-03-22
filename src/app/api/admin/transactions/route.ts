// =====================================================
// ADMIN TRANSACTIONS API
// Handles deposit/withdrawal management for admin panel
// VIP is based on BALANCE, automatically calculated
// Referral Commission: Level 1 = 10%, Level 2 = 5%, Level 3 = 2%
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

// Commission rates for referral levels
const COMMISSION_RATES: Record<number, number> = {
  1: 10,  // Level 1: 10%
  2: 5,   // Level 2: 5%
  3: 2,   // Level 3: 2%
};

// GET - List all transactions
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type'); // 'deposit' or 'withdraw'
    const status = searchParams.get('status'); // 'pending', 'approved', 'rejected'
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const transactions = await db.transaction.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            vipLevel: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    const total = await db.transaction.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        transactions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update transaction status (approve/reject)
export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, status, adminNote } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID and status are required' },
        { status: 400 }
      );
    }

    // Get the transaction
    const transaction = await db.transaction.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!transaction) {
      return NextResponse.json(
        { success: false, error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Prevent updating already processed transactions
    if (transaction.status !== 'pending') {
      return NextResponse.json(
        { success: false, error: `Transaction is already ${transaction.status}` },
        { status: 400 }
      );
    }

    // Update transaction status
    const updatedTransaction = await db.transaction.update({
      where: { id },
      data: {
        status,
        adminNote,
      },
    });

    // Handle balance changes based on transaction type and status
    if (transaction.type === 'deposit') {
      if (status === 'approved') {
        // Add balance to user
        await db.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });

        // Check if this is the user's first deposit and process referral commissions
        if (!transaction.user.firstDepositMade) {
          await processReferralCommissions(transaction.userId, transaction.amount, transaction.id);
          
          // Mark first deposit as made
          await db.user.update({
            where: { id: transaction.userId },
            data: { firstDepositMade: true },
          });
        }
      }
      // If deposit is rejected, no balance change needed
    } else if (transaction.type === 'withdraw') {
      if (status === 'rejected') {
        // Refund the balance when withdrawal is rejected
        await db.user.update({
          where: { id: transaction.userId },
          data: {
            balance: {
              increment: transaction.amount,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Transaction ${status} successfully`,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Process referral commissions for 3 levels
async function processReferralCommissions(
  userId: string,
  depositAmount: number,
  depositId: string
) {
  // Get user's referrer (Level 1)
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { referrerId: true },
  });

  if (!user?.referrerId) {
    console.log(`[Commission] User ${userId} has no referrer`);
    return;
  }

  // Level 1: Direct referrer
  const level1Referrer = await db.user.findUnique({
    where: { id: user.referrerId },
    select: { id: true, referrerId: true, username: true },
  });

  if (level1Referrer) {
    const commission1 = (depositAmount * COMMISSION_RATES[1]) / 100;
    
    // Create commission record and update balance
    await db.$transaction([
      db.referralCommission.create({
        data: {
          userId: level1Referrer.id,
          referralId: userId,
          depositId,
          depositAmount,
          commissionRate: COMMISSION_RATES[1],
          commissionAmount: commission1,
          level: 1,
          status: 'paid',
        },
      }),
      db.user.update({
        where: { id: level1Referrer.id },
        data: {
          balance: { increment: commission1 },
          totalCommission: { increment: commission1 },
        },
      }),
    ]);
    
    console.log(`[Commission] Level 1: ${level1Referrer.username} earned $${commission1.toFixed(2)}`);

    // Level 2: Referrer's referrer
    if (level1Referrer.referrerId) {
      const level2Referrer = await db.user.findUnique({
        where: { id: level1Referrer.referrerId },
        select: { id: true, referrerId: true, username: true },
      });

      if (level2Referrer) {
        const commission2 = (depositAmount * COMMISSION_RATES[2]) / 100;
        
        await db.$transaction([
          db.referralCommission.create({
            data: {
              userId: level2Referrer.id,
              referralId: userId,
              depositId,
              depositAmount,
              commissionRate: COMMISSION_RATES[2],
              commissionAmount: commission2,
              level: 2,
              status: 'paid',
            },
          }),
          db.user.update({
            where: { id: level2Referrer.id },
            data: {
              balance: { increment: commission2 },
              totalCommission: { increment: commission2 },
            },
          }),
        ]);
        
        console.log(`[Commission] Level 2: ${level2Referrer.username} earned $${commission2.toFixed(2)}`);

        // Level 3: Referrer's referrer's referrer
        if (level2Referrer.referrerId) {
          const level3Referrer = await db.user.findUnique({
            where: { id: level2Referrer.referrerId },
            select: { id: true, username: true },
          });

          if (level3Referrer) {
            const commission3 = (depositAmount * COMMISSION_RATES[3]) / 100;
            
            await db.$transaction([
              db.referralCommission.create({
                data: {
                  userId: level3Referrer.id,
                  referralId: userId,
                  depositId,
                  depositAmount,
                  commissionRate: COMMISSION_RATES[3],
                  commissionAmount: commission3,
                  level: 3,
                  status: 'paid',
                },
              }),
              db.user.update({
                where: { id: level3Referrer.id },
                data: {
                  balance: { increment: commission3 },
                  totalCommission: { increment: commission3 },
                },
              }),
            ]);
            
            console.log(`[Commission] Level 3: ${level3Referrer.username} earned $${commission3.toFixed(2)}`);
          }
        }
      }
    }
  }
}
