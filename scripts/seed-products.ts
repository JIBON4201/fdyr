// =====================================================
// UPDATE PRODUCTS SCRIPT - Make VIP 1 products accessible for new users
// Run with: bun run scripts/seed-products.ts
// =====================================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Updating products for new users...');

  // Update VIP 1 products to have minBalance of 0 so new users can buy them
  const result = await prisma.product.updateMany({
    where: { vipLevel: 1 },
    data: { minBalance: 0 },
  });

  console.log(`✅ Updated ${result.count} VIP 1 products to be accessible for new users (minBalance: 0)`);

  // Show updated products
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ vipLevel: 'asc' }, { order: 'asc' }],
    take: 5,
  });

  console.log('\nFirst 5 products:');
  products.forEach(p => {
    console.log(`- ${p.name} (VIP ${p.vipLevel}): Balance ${p.minBalance}-${p.maxBalance}, Commission: ${p.commission}%`);
  });
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
