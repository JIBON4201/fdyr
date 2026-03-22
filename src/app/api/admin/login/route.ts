// =====================================================
// ADMIN LOGIN API
// Handles admin authentication
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, createAdminSession } from '@/lib/auth';

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

    // Find admin user
    const admin = await db.user.findUnique({
      where: { username },
    });

    if (!admin || !admin.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, admin.password)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin credentials' },
        { status: 401 }
      );
    }

    // Create admin session
    await createAdminSession(admin.id);

    return NextResponse.json({
      success: true,
      message: 'Admin login successful',
      data: {
        id: admin.id,
        username: admin.username,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
