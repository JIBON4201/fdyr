// =====================================================
// DATABASE SEED SCRIPT
// Populates the database with initial data
// Run with: bun run seed.ts
// =====================================================

import { db } from './src/lib/db';
import { hashPassword, generateInviteCode } from './src/lib/auth';

async function main() {
  console.log('Starting database seed...');

  // Create admin user
  const adminExists = await db.user.findFirst({
    where: { isAdmin: true },
  });

  if (!adminExists) {
    const hashedPassword = hashPassword('admin123');
    await db.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        inviteCode: 'ADMIN01',
        isAdmin: true,
        balance: 0,
        vipLevel: 99,
        status: 'active',
      },
    });
    console.log('✓ Admin user created (username: admin, password: admin123)');
  } else {
    console.log('✓ Admin user already exists');
  }

  // VIP System based on BALANCE:
  // VIP 0: $1 - $250
  // VIP 1: $251 - $800
  // VIP 2: $801 - $2000
  // VIP 3: $2001+

  const productsData = [
    // ==================== VIP 0 Products ($1-$250) ====================
    // Commission: 2-3%
    { name: 'Starter Pack', icon: '🎁', vipLevel: 0, minBalance: 1, maxBalance: 50, commission: 2 },
    { name: 'Basic Order', icon: '📦', vipLevel: 0, minBalance: 51, maxBalance: 100, commission: 2.5 },
    { name: 'Standard Task', icon: '✅', vipLevel: 0, minBalance: 101, maxBalance: 150, commission: 2.5 },
    { name: 'Easy Match', icon: '🎯', vipLevel: 0, minBalance: 151, maxBalance: 200, commission: 3 },
    { name: 'Quick Order', icon: '⚡', vipLevel: 0, minBalance: 201, maxBalance: 250, commission: 3 },

    // ==================== VIP 1 Products ($251-$800) ====================
    // Commission: 4-5%
    { name: 'Amazon', icon: '📦', vipLevel: 1, minBalance: 251, maxBalance: 350, commission: 4 },
    { name: 'eBay', icon: '🛒', vipLevel: 1, minBalance: 351, maxBalance: 450, commission: 4 },
    { name: 'Walmart', icon: '🏪', vipLevel: 1, minBalance: 451, maxBalance: 550, commission: 4.5 },
    { name: 'Target', icon: '🎯', vipLevel: 1, minBalance: 551, maxBalance: 650, commission: 5 },
    { name: 'Best Buy', icon: '💻', vipLevel: 1, minBalance: 651, maxBalance: 800, commission: 5 },

    // ==================== VIP 2 Products ($801-$2000) ====================
    // Commission: 6-8%
    { name: 'Alibaba', icon: '🌐', vipLevel: 2, minBalance: 801, maxBalance: 1000, commission: 6 },
    { name: 'Rakuten', icon: '🛍️', vipLevel: 2, minBalance: 1001, maxBalance: 1200, commission: 6.5 },
    { name: 'Shopify', icon: '🏪', vipLevel: 2, minBalance: 1201, maxBalance: 1400, commission: 7 },
    { name: 'Mercado', icon: '🌎', vipLevel: 2, minBalance: 1401, maxBalance: 1700, commission: 7.5 },
    { name: 'Otto', icon: '🏬', vipLevel: 2, minBalance: 1701, maxBalance: 2000, commission: 8 },

    // ==================== VIP 3 Products ($2001+) ====================
    // Commission: 10-12%
    { name: 'AliExpress', icon: '🌍', vipLevel: 3, minBalance: 2001, maxBalance: 3000, commission: 10 },
    { name: 'JD.com', icon: '📱', vipLevel: 3, minBalance: 3001, maxBalance: 5000, commission: 10.5 },
    { name: 'Pinduoduo', icon: '🛒', vipLevel: 3, minBalance: 5001, maxBalance: 8000, commission: 11 },
    { name: 'Premium', icon: '👑', vipLevel: 3, minBalance: 8001, maxBalance: 99999, commission: 12 },
  ];

  // Delete existing products and recreate (must delete orders first due to foreign key)
  const existingProducts = await db.product.count();
  if (existingProducts > 0) {
    await db.order.deleteMany();
    await db.product.deleteMany();
    console.log('✓ Cleared existing products and orders');
  }

  for (let i = 0; i < productsData.length; i++) {
    await db.product.create({
      data: {
        ...productsData[i],
        order: i,
        isActive: true,
      },
    });
  }
  console.log(`✓ Created ${productsData.length} products`);

  // Create deposit addresses
  const existingAddresses = await db.depositAddress.count();
  if (existingAddresses === 0) {
    await db.depositAddress.createMany({
      data: [
        { address: 'TRX123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', protocol: 'TRC-20', isActive: true },
        { address: '0x123456789ABCDEF0123456789ABCDEF012345678', protocol: 'ERC-20', isActive: true },
      ],
    });
    console.log('✓ Created deposit addresses');
  } else {
    console.log('✓ Deposit addresses already exist');
  }

  // Create settings
  const existingSettings = await db.setting.count();
  if (existingSettings === 0) {
    await db.setting.createMany({
      data: [
        { key: 'customer_service_hours', value: '07:00-23:00 (UK)', description: 'Customer service operating hours' },
        { key: 'customer_service_link', value: 'https://t.me/support', description: 'Customer service link' },
        { key: 'customer_service_message', value: 'Online customer service', description: 'Customer service button text' },
        { key: 'help_message', value: 'Help Center - Find answers to common questions', description: 'Help message' },
        { key: 'platform_intro', value: 'MALL is an intelligent cloud global order matching center.', description: 'Platform introduction' },
      ],
    });
    console.log('✓ Created settings');
  } else {
    console.log('✓ Settings already exist');
  }

  // Create invite codes
  const existingCodes = await db.inviteCode.count();
  if (existingCodes === 0) {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push({ code: generateInviteCode() });
    }
    await db.inviteCode.createMany({ data: codes });
    console.log('✓ Created 10 invite codes');
  } else {
    console.log('✓ Invite codes already exist');
  }

  // Create sample messages
  const existingMessages = await db.message.count();
  if (existingMessages === 0) {
    await db.message.createMany({
      data: [
        {
          type: 'announcement',
          title: 'USDT Recharge Method Update',
          content: 'To ensure the security of your assets, please strictly adhere to the official recharge address. Do not trust any unofficial channels.',
          isActive: true,
        },
        {
          type: 'announcement',
          title: 'VIP Level System',
          content: 'VIP 0: $1-$250 balance, 2-3% commission. VIP 1: $251-$800, 4-5% commission. VIP 2: $801-$2000, 6-8% commission. VIP 3: $2001+, 10-12% commission.',
          isActive: true,
        },
        {
          type: 'activity',
          title: 'New User Bonus',
          content: 'New users can get extra bonus on first deposit. Limited time offer!',
          isActive: true,
        },
      ],
    });
    console.log('✓ Created sample messages');
  } else {
    console.log('✓ Messages already exist');
  }

  console.log('\n✅ Database seed completed!');
  console.log('\n📋 Admin Login:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('\n📝 Available Invite Codes:');
  const codes = await db.inviteCode.findMany({
    where: { isUsed: false },
    take: 5,
  });
  codes.forEach((c) => console.log(`   - ${c.code}`));
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
