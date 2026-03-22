// =====================================================
// USER LOGOUT API
// Clears user session and redirects to home
// =====================================================

import { NextResponse } from 'next/server';
import { clearUserSession, clearAdminSession } from '@/lib/auth';
import { cache } from '@/lib/cache';
import { db } from '@/lib/db';

export async function POST() {
  try {
    // Clear user session from database and cookies
    await clearUserSession();
    
    // Clear all cache
    cache.clear();
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
    
    // Clear cookies in response as well (belt and suspenders)
    response.cookies.set('mall_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('mall_user_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('mall_admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('mall_admin_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support GET for direct navigation
export async function GET() {
  try {
    // Clear all sessions from database
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    
    const sessionId = cookieStore.get('mall_session')?.value;
    const adminSessionId = cookieStore.get('mall_admin_session')?.value;
    
    // Delete sessions from database
    if (sessionId) {
      await db.session.deleteMany({ where: { id: sessionId } }).catch(() => {});
    }
    if (adminSessionId) {
      await db.session.deleteMany({ where: { id: adminSessionId } }).catch(() => {});
    }
    
    // Clear sessions
    await clearUserSession();
    await clearAdminSession();
    cache.clear();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = NextResponse.redirect(new URL('/', baseUrl));
    
    // Clear all cookies
    response.cookies.set('mall_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('mall_user_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('mall_admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    response.cookies.set('mall_admin_id', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/', baseUrl));
  }
}
