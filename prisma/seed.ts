// =====================================================
// DATABASE SEED SCRIPT
// Run with: bunx tsx prisma/seed.ts
// =====================================================

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

// Password hashing function (same as in lib/auth.ts)
function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'mall_salt_2024').digest('hex');
}

async function main() {
  console.log('🌱 Starting database seed...');

  // =====================================================
  // CREATE ADMIN USER
  // =====================================================
  const adminPassword = hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      balance: 0,
      vipLevel: 3,
      inviteCode: 'ADMIN001',
      status: 'active',
      isAdmin: true,
    },
  });
  console.log('✅ Admin user created:', admin.username);

  // =====================================================
  // CREATE TEST USER
  // =====================================================
  const testPassword = hashPassword('test123');
  const testUser = await prisma.user.upsert({
    where: { username: 'test' },
    update: {},
    create: {
      username: 'test',
      password: testPassword,
      balance: 100,
      vipLevel: 0,
      inviteCode: 'TESTUSER1',
      status: 'active',
      isAdmin: false,
    },
  });
  console.log('✅ Test user created:', testUser.username, '(password: test123)');

  // =====================================================
  // CREATE PRODUCTS (18 total)
  // =====================================================
  // Delete orders first (due to foreign key constraint)
  await prisma.order.deleteMany({});
  // Then delete all existing products
  await prisma.product.deleteMany({});
  console.log('✅ Cleared existing products');

  // Create 18 new products with commissions 4-12%
  const products = [
    // VIP 0 Products (6 products) - Commission: 4-5%
    { name: 'Newcomer Task A', icon: '🛒', vipLevel: 0, minBalance: 0, maxBalance: 50, commission: 4.0, order: 1, isActive: true },
    { name: 'Newcomer Task B', icon: '📦', vipLevel: 0, minBalance: 10, maxBalance: 100, commission: 4.2, order: 2, isActive: true },
    { name: 'Basic Order Match', icon: '🎯', vipLevel: 0, minBalance: 30, maxBalance: 150, commission: 4.5, order: 3, isActive: true },
    { name: 'Simple Shopping Task', icon: '🛍️', vipLevel: 0, minBalance: 50, maxBalance: 200, commission: 4.7, order: 4, isActive: true },
    { name: 'Entry Level Bundle', icon: '🎁', vipLevel: 0, minBalance: 80, maxBalance: 250, commission: 4.8, order: 5, isActive: true },
    { name: 'Beginner Special', icon: '⭐', vipLevel: 0, minBalance: 100, maxBalance: 300, commission: 5.0, order: 6, isActive: true },

    // VIP 1 Products (5 products) - Commission: 6-7%
    { name: 'Standard Task A', icon: '💼', vipLevel: 1, minBalance: 100, maxBalance: 400, commission: 6.0, order: 7, isActive: true },
    { name: 'Standard Task B', icon: '🏆', vipLevel: 1, minBalance: 200, maxBalance: 500, commission: 6.3, order: 8, isActive: true },
    { name: 'Premium Order Match', icon: '💎', vipLevel: 1, minBalance: 300, maxBalance: 600, commission: 6.5, order: 9, isActive: true },
    { name: 'Advanced Shopping', icon: '🌟', vipLevel: 1, minBalance: 500, maxBalance: 700, commission: 6.8, order: 10, isActive: true },
    { name: 'VIP1 Exclusive', icon: '👑', vipLevel: 1, minBalance: 800, maxBalance: 999, commission: 7.0, order: 11, isActive: true },

    // VIP 2 Products (4 products) - Commission: 8-9%
    { name: 'Professional Task A', icon: '🚀', vipLevel: 2, minBalance: 1000, maxBalance: 1500, commission: 8.0, order: 12, isActive: true },
    { name: 'Professional Task B', icon: '💫', vipLevel: 2, minBalance: 2000, maxBalance: 2500, commission: 8.5, order: 13, isActive: true },
    { name: 'Expert Order Match', icon: '🔥', vipLevel: 2, minBalance: 3000, maxBalance: 4000, commission: 8.8, order: 14, isActive: true },
    { name: 'VIP2 Premium Bundle', icon: '💰', vipLevel: 2, minBalance: 5000, maxBalance: 8000, commission: 9.0, order: 15, isActive: true },

    // VIP 3 Products (3 products) - Commission: 10-12%
    { name: 'Elite Task A', icon: '🏅', vipLevel: 3, minBalance: 10000, maxBalance: 20000, commission: 10.0, order: 16, isActive: true },
    { name: 'Elite Task B', icon: '🎖️', vipLevel: 3, minBalance: 20000, maxBalance: 50000, commission: 11.0, order: 17, isActive: true },
    { name: 'VIP3 Ultimate', icon: '👑', vipLevel: 3, minBalance: 50000, maxBalance: 99999, commission: 12.0, order: 18, isActive: true },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`✅ Created ${products.length} products`);

  // =====================================================
  // CREATE DEPOSIT ADDRESSES
  // =====================================================
  const depositAddresses = [
    { address: 'TRX1234567890abcdefghijklmnopqrstuvwxyz', protocol: 'TRC-20', isActive: true },
    { address: '0x1234567890abcdef1234567890abcdef12345678', protocol: 'ERC-20', isActive: true },
  ];

  for (const addr of depositAddresses) {
    await prisma.depositAddress.upsert({
      where: { id: `seed-${addr.protocol}` },
      update: {},
      create: { id: `seed-${addr.protocol}`, ...addr },
    });
  }
  console.log(`✅ Created ${depositAddresses.length} deposit addresses`);

  // =====================================================
  // CREATE ADMIN INVITE CODES
  // =====================================================
  const inviteCodes = ['WELCOME', 'VIP2024', 'SPECIAL'];
  
  for (const code of inviteCodes) {
    await prisma.inviteCode.upsert({
      where: { code },
      update: {},
      create: { code, isUsed: false },
    });
  }
  console.log(`✅ Created ${inviteCodes.length} invite codes`);

  // =====================================================
  // CREATE SETTINGS
  // =====================================================
  const settings = [
    { key: 'platform_intro', value: 'MALL is an intelligent cloud global order matching center. Complete tasks to earn commissions!', description: 'Platform introduction text' },
    { key: 'customer_service_link', value: 'https://t.me/Customerservice1541', description: 'Customer service Telegram URL' },
    { key: 'customer_service_whatsapp', value: 'https://wa.me/1234567890', description: 'Customer service WhatsApp URL' },
    { key: 'customer_service_email', value: 'support@mall.com', description: 'Customer service email' },
  ];

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log(`✅ Created ${settings.length} settings`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
