import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Boshlang'ich ma'lumot: egа (Adam) + ikkita workspace + bittа umumiy xarajat.
 * Ishga tushirish: npm run db:seed
 */
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('woodflow', 10);

  const adam = await prisma.user.upsert({
    where: { phone: '+998901234567' },
    update: {},
    create: {
      name: 'Adam (Juraev Otabek)',
      phone: '+998901234567',
      passwordHash,
    },
  });

  // IDEMPOTENT: Adam'da allaqachon workspace bo'lsa, qayta yaratmaymiz.
  // (Aks holda seed ikki marta ishlasa dublikat workspace paydo bo'ladi.)
  const existing = await prisma.membership.count({
    where: { userId: adam.id },
  });
  if (existing > 0) {
    // eslint-disable-next-line no-console
    console.log('Seed: workspacelar allaqachon mavjud — o‘tkazib yuborildi.');
    return;
  }

  const wood = await prisma.workspace.create({
    data: { name: 'Yog‘och sotuvi', type: 'WOOD_TRADING' },
  });
  const lumber = await prisma.workspace.create({
    data: { name: 'Taxta sotuvi', type: 'LUMBER_PRODUCTION' },
  });

  await prisma.membership.createMany({
    data: [
      { userId: adam.id, workspaceId: wood.id, role: 'OWNER' },
      { userId: adam.id, workspaceId: lumber.id, role: 'OWNER' },
    ],
  });

  await prisma.exchangeRate.create({
    data: {
      date: new Date(),
      rubToUzs: '145.000000', // namuna
      usdToUzs: '12600.000000',
    },
  });

  await prisma.expense.create({
    data: {
      workspaceId: null, // umumiy
      category: 'ELECTRICITY',
      amountUzs: '320000',
      date: new Date(),
      description: 'Svet to‘lovi (namuna)',
    },
  });

  // eslint-disable-next-line no-console
  console.log('Seed tayyor. Login: +998901234567 / woodflow');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
