// =====================================================
// ADMIN INVITE CODES API
// Handles invite code management
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';
import { generateInviteCode } from '@/lib/auth';

// GET - List all invite codes
export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const inviteCodes = await db.inviteCode.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });

    // Get usernames for used codes
    const usedByIds = inviteCodes.filter(ic => ic.usedBy).map(ic => ic.usedBy);
    const users = usedByIds.length > 0 ? await db.user.findMany({
      where: { id: { in: usedByIds } },
      select: { id: true, username: true },
    }) : [];

    const userMap = new Map(users.map(u => [u.id, u]));
    const inviteCodesWithUser = inviteCodes.map(ic => ({
      ...ic,
      usedByUsername: ic.usedBy ? userMap.get(ic.usedBy)?.username : null,
    }));

    const total = await db.inviteCode.count();

    return NextResponse.json({
      success: true,
      data: {
        inviteCodes: inviteCodesWithUser,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get invite codes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Generate new invite codes
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { count = 1 } = body;

    const codes: Array<{ code: string }> = [];
    for (let i = 0; i < count; i++) {
      const code = generateInviteCode();
      await db.inviteCode.create({
        data: { code },
      });
      codes.push({ code });
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${count} invite code(s)`,
      data: codes,
    });
  } catch (error) {
    console.error('Generate invite codes error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete invite code
export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Invite code ID is required' },
        { status: 400 }
      );
    }

    // Check if code is used
    const inviteCode = await db.inviteCode.findUnique({
      where: { id },
    });

    if (inviteCode?.isUsed) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete used invite code' },
        { status: 400 }
      );
    }

    await db.inviteCode.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Invite code deleted successfully',
    });
  } catch (error) {
    console.error('Delete invite code error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
