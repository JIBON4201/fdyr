// =====================================================
// AUTHENTICATION UTILITIES
// Handles password hashing, session management, and auth helpers
// =====================================================

import { cookies } from 'next/headers';
import { db } from './db';
import { randomBytes, createHash } from 'crypto';

// Simple password hashing using SHA-256
export function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'mall_salt_2024').digest('hex');
}

// Verify password
export function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// Generate unique invite code
export function generateInviteCode(): string {
  return randomBytes(3).toString('hex').toUpperCase();
}

// Session management
const SESSION_COOKIE_NAME = 'mall_session';
const ADMIN_SESSION_COOKIE_NAME = 'mall_admin_session';
const SESSION_EXPIRY_DAYS = 7;
const ADMIN_SESSION_EXPIRY_DAYS = 1;

// Create user session (cookie-based)
export async function createUserSession(userId: string): Promise<string> {
  const sessionId = randomBytes(32).toString('hex');

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS,
    path: '/',
  });

  cookieStore.set('mall_user_id', userId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS,
    path: '/',
  });

  return sessionId;
}

// Create admin session (cookie-based)
export async function createAdminSession(adminId: string): Promise<string> {
  const sessionId = randomBytes(32).toString('hex');

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * ADMIN_SESSION_EXPIRY_DAYS,
    path: '/',
  });

  cookieStore.set('mall_admin_id', adminId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * ADMIN_SESSION_EXPIRY_DAYS,
    path: '/',
  });

  return sessionId;
}

// Get current user from session
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get('mall_user_id')?.value;

    if (!userId) {
      return null;
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        balance: true,
        vipLevel: true,
        inviteCode: true,
        referrerId: true,
        status: true,
        isAdmin: true,
        totalCommission: true,
        firstDepositMade: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

// Get current admin
export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const adminId = cookieStore.get('mall_admin_id')?.value;

    if (!adminId) {
      return null;
    }

    const admin = await db.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || !admin.isAdmin) {
      return null;
    }

    return admin;
  } catch (error) {
    console.error('getCurrentAdmin error:', error);
    return null;
  }
}

// Clear user session
export async function clearUserSession() {
  try {
    const cookieStore = await cookies();

    cookieStore.set(SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    cookieStore.set('mall_user_id', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  } catch (error) {
    console.error('Error clearing user session:', error);
  }
}

// Clear admin session
export async function clearAdminSession() {
  try {
    const cookieStore = await cookies();

    cookieStore.set(ADMIN_SESSION_COOKIE_NAME, '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    cookieStore.set('mall_admin_id', '', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
  } catch (error) {
    console.error('Error clearing admin session:', error);
  }
}

// Check if user is logged in
export async function isLoggedIn(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

// Check if admin is logged in
export async function isAdminLoggedIn(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin !== null;
}
