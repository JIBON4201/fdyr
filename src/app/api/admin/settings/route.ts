// =====================================================
// ADMIN SETTINGS API
// Handles site-wide settings management
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

// GET - Get all settings
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const settings = await db.setting.findMany();
    
    // Convert to object for easier access
    const settingsObj: Record<string, string> = {};
    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      data: settingsObj,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update settings
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
    const { settings } = body; // Array of { key, value, description }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { success: false, error: 'Settings array is required' },
        { status: 400 }
      );
    }

    // Update or create each setting
    for (const setting of settings) {
      await db.setting.upsert({
        where: { key: setting.key },
        update: {
          value: setting.value,
          description: setting.description,
        },
        create: {
          key: setting.key,
          value: setting.value,
          description: setting.description,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
