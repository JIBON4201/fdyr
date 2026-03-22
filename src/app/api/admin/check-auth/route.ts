/**
 * Admin Check Auth API Route
 * Checks if admin is logged in
 */

import { NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/auth';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    
    if (admin) {
      return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
          id: admin.id,
          username: admin.username,
          role: admin.isAdmin ? 'admin' : 'user',
        },
      });
    }
    
    return NextResponse.json({
      success: false,
      authenticated: false,
    });
  } catch (error) {
    console.error('Check auth error:', error);
    return NextResponse.json({
      success: false,
      authenticated: false,
    });
  }
}
