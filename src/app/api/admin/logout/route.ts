// =====================================================
// ADMIN LOGOUT API
// Clears admin session
// =====================================================

import { NextResponse } from 'next/server';
import { clearAdminSession } from '@/lib/auth';
import { db } from '@/lib/db';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Delete session from database
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('mall_admin_session')?.value;
    
    if (sessionId) {
      await db.session.deleteMany({ where: { id: sessionId } }).catch(() => {});
    }
    
    // Clear admin session cookies
    await clearAdminSession();
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Admin logged out successfully',
    });
    
    // Clear cookies in response
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
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Support GET for direct navigation
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('mall_admin_session')?.value;
    
    if (sessionId) {
      await db.session.deleteMany({ where: { id: sessionId } }).catch(() => {});
    }
    
    await clearAdminSession();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const response = NextResponse.redirect(new URL('/admin', baseUrl));
    
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
    console.error('Admin logout error:', error);
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return NextResponse.redirect(new URL('/admin', baseUrl));
  }
}
