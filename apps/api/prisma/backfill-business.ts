import { PrismaClient } from '@prisma/client';

/**
 * Bir martalik backfill: business_roles_approvals migratsiyasidan keyin.
 *  - Adam (+998901234567) → platformRole CEO
 *  - Har bir OWNER-membershipli user uchun: uning workspace'larini
 *    bitta ACTIVE Business ostiga yig'adi (nomi: "<ism> biznesi",
 *    Adam uchun "WoodFlow").
 *  - Employee.businessId — workspace orqali to'ldiriladi.
 * Idempotent: businessId allaqachon to'lgan workspace'lar o'tkazib yuboriladi.
 */
const prisma = new PrismaClient();

async function main() {
  // 1) Adam → CEO
  const adam = await prisma.user.update({
    where: { phone: '+998901234567' },
    data: { platformRole: 'CEO' },
  });
  console.log(`CEO: ${adam.name}`);

  // 2) Har user uchun biznes
  const users = await prisma.user.findMany({
    include: {
      memberships: { include: { workspace: true } },
    },
  });

  for (const user of users) {
    const orphanWs = user.memberships
      .map((m) => m.workspace)
      .filter((w) => !w.businessId);
    if (orphanWs.length === 0) continue;

    // Faqat OWNER bo'lgan workspace'lar uchun biznes ochamiz;
    // WORKER-only user (test) uchun ham workspace'lari o'ziniki bo'lgani
    // uchun o'sha userga bog'laymiz.
    const name =
      user.phone === '+998901234567' ? 'WoodFlow' : `${user.name} biznesi`;

    const business = await prisma.business.create({
      data: { name, ownerId: user.id, status: 'ACTIVE' },
    });
    await prisma.workspace.updateMany({
      where: { id: { in: orphanWs.map((w) => w.id) } },
      data: { businessId: business.id },
    });
    console.log(`Business "${name}" ← ${orphanWs.length} workspace`);
  }

  // 3) Employee.businessId backfill (workspace orqali)
  const employees = await prisma.employee.findMany({
    where: { businessId: null, workspaceId: { not: null } },
    include: { workspace: true },
  });
  for (const emp of employees) {
    if (emp.workspace?.businessId) {
      await prisma.employee.update({
        where: { id: emp.id },
        data: { businessId: emp.workspace.businessId },
      });
    }
  }
  console.log(`Employee backfill: ${employees.length} ta`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
