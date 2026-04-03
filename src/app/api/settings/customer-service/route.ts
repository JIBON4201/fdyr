// =====================================================
// CUSTOMER SERVICE SETTINGS API
// Returns customer service settings for main app
// =====================================================

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: [
            'customer_service_hours',
            'customer_service_link',
            'customer_service_message',
            'help_message',
          ],
        },
      },
    });

    // Convert to object
    const settingsObj: Record<string, string> = {
      customer_service_hours: '07:00-23:00 (UK)',
      customer_service_link: 'https://t.me/Customerservice1541',
      customer_service_message: 'Online customer service',
      help_message: 'Help',
    };

    settings.forEach((s) => {
      settingsObj[s.key] = s.value;
    });

    return NextResponse.json({
      success: true,
      data: settingsObj,
    });
  } catch (error) {
    console.error('Get customer service settings error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
