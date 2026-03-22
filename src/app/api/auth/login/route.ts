// =====================================================
// USER LOGIN API
// Handles user authentication
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createUserSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, user.password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Check if user is admin - redirect to admin login
    if (user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Admin users must login through admin panel' },
        { status: 403 }
      );
    }

    // Check user status
    if (user.status === 'suspended') {
      return NextResponse.json(
        { success: false, error: 'Account is suspended' },
        { status: 403 }
      );
    }

    // Create session
    await createUserSession(user.id);

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      data: {
        id: user.id,
        username: user.username,
        balance: user.balance,
        vipLevel: user.vipLevel,
        inviteCode: user.inviteCode,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
