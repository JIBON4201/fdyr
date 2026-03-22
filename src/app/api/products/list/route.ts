// =====================================================
// PRODUCTS LIST API
// Returns active products for the main app
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const vipLevel = searchParams.get('vipLevel');

    const where: Record<string, unknown> = { isActive: true };
    if (vipLevel) {
      where.vipLevel = parseInt(vipLevel);
    }

    const products = await db.product.findMany({
      where,
      orderBy: [{ vipLevel: 'asc' }, { order: 'asc' }],
    });

    return NextResponse.json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
