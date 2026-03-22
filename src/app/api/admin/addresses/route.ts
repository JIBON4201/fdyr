// =====================================================
// ADMIN DEPOSIT ADDRESSES API
// Handles deposit address management for admin panel
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentAdmin } from '@/lib/auth';

// GET - List all deposit addresses
export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const addresses = await db.depositAddress.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: addresses,
    });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new deposit address
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
    const { address, protocol } = body;

    if (!address || !protocol) {
      return NextResponse.json(
        { success: false, error: 'Address and protocol are required' },
        { status: 400 }
      );
    }

    const depositAddress = await db.depositAddress.create({
      data: {
        address,
        protocol,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit address created successfully',
      data: depositAddress,
    });
  } catch (error) {
    console.error('Create address error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update deposit address
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
    const { id, address, protocol, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (address !== undefined) updateData.address = address;
    if (protocol !== undefined) updateData.protocol = protocol;
    if (isActive !== undefined) updateData.isActive = isActive;

    const depositAddress = await db.depositAddress.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit address updated successfully',
      data: depositAddress,
    });
  } catch (error) {
    console.error('Update address error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete deposit address
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
        { success: false, error: 'Address ID is required' },
        { status: 400 }
      );
    }

    await db.depositAddress.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit address deleted successfully',
    });
  } catch (error) {
    console.error('Delete address error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
