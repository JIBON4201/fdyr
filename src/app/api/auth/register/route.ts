// =====================================================
// USER REGISTRATION API
// Handles new user registration with invite code requirement
// Users can use any active user's invite code OR admin-generated codes
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, generateInviteCode, createUserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, confirmPassword, inviteCode } = body;

    // Validate input
    if (!username || !password || !confirmPassword || !inviteCode) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate username (6-16 letters or numbers)
    if (!/^[a-zA-Z0-9]{6,16}$/.test(username)) {
      return NextResponse.json(
        { success: false, error: 'Username must be 6-16 letters or numbers' },
        { status: 400 }
      );
    }

    // Validate password (6-16 alphanumeric)
    if (!/^[a-zA-Z0-9]{6,16}$/.test(password)) {
      return NextResponse.json(
        { success: false, error: 'Password must be 6-16 alphanumeric characters' },
        { status: 400 }
      );
    }

    // Check password confirmation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUser = await db.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Find referrer - check if invite code belongs to an active user
    const referrer = await db.user.findFirst({
      where: {
        inviteCode: inviteCode,
        status: 'active',
        isAdmin: false,
      },
    });

    // Also check admin-generated invite codes table
    const adminInviteCode = await db.inviteCode.findUnique({
      where: { code: inviteCode },
    });

    // Validate invite code - must be from active user OR admin-generated
    if (!referrer && (!adminInviteCode || adminInviteCode.isUsed)) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired invite code' },
        { status: 400 }
      );
    }

    // Create user
    const hashedPassword = hashPassword(password);
    const userInviteCode = generateInviteCode();

    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        inviteCode: userInviteCode,
        referrerId: referrer?.id || null,
        balance: 0,
        vipLevel: 0,
        status: 'active',
        isAdmin: false,
      },
    });

    // If used admin-generated code, mark it as used
    if (adminInviteCode && !referrer) {
      await db.inviteCode.update({
        where: { id: adminInviteCode.id },
        data: {
          isUsed: true,
          usedBy: user.id,
        },
      });
    }

    // Create team member record for referral tracking
    if (referrer) {
      await db.teamMember.create({
        data: {
          userId: referrer.id,
          referralId: user.id,
          level: 1,
        },
      });

      // Also add to level 2 and 3 referrers (referrer's referrer chain)
      const referrerReferrer = await db.user.findUnique({
        where: { id: referrer.id },
        select: { referrerId: true },
      });

      if (referrerReferrer?.referrerId) {
        await db.teamMember.create({
          data: {
            userId: referrerReferrer.referrerId,
            referralId: user.id,
            level: 2,
          },
        });

        // Level 3
        const level3Referrer = await db.user.findUnique({
          where: { id: referrerReferrer.referrerId },
          select: { referrerId: true },
        });

        if (level3Referrer?.referrerId) {
          await db.teamMember.create({
            data: {
              userId: level3Referrer.referrerId,
              referralId: user.id,
              level: 3,
            },
          });
        }
      }
    }

    // Create session
    await createUserSession(user.id);

    return NextResponse.json({
      success: true,
      message: 'Registration successful',
      data: {
        id: user.id,
        username: user.username,
        inviteCode: user.inviteCode,
        referrer: referrer?.username || null,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
