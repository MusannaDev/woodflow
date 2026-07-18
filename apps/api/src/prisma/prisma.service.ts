import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { getTenant } from '../common/tenant/tenant-context';

/**
 * Qat'iy tenant-scoped modellar: har birida workspaceId ustuni MAVJUD va
 * NULL bo'lmaydi. Bularda o'qish avtomatik joriy workspace bilan filtrlanadi,
 * create esa avtomatik workspaceId oladi.
 *
 * MUHIM: Expense va Employee bu ro'yxatda YO'Q — chunki ularda workspaceId
 * nullable (null = "umumiy"). Ularni service'da qo'lda filtrlaymiz:
 * { OR: [{ workspaceId }, { workspaceId: null }] }.
 */
const TENANT_MODELS = new Set<string>([
  'Supplier',
  'Customer',
  'Shipment',
  'Purchase',
  'InventoryLot',
  'Sale',
  'ProductTemplate',
  'ProductionBatch',
  'FinishedGoodsLot',
  'LedgerEntry',
]);

// DIQQAT: findUnique/findUniqueOrThrow shu ro'yxatda YO'Q. Prisma ularning
// where'iga faqat unique maydonlarni qabul qiladi — workspaceId (unique emas)
// qo'shsak, xato beradi. Bitta yozuvni tenant-xavfsiz olish uchun service'da
// findFirst({ where: { id, workspaceId } }) ishlatamiz. Xuddi shu sabab
// update/delete/upsert ham avtomatik filtrlanmaydi — updateMany/deleteMany
// (yoki avval findFirst tekshiruvi) bilan aniq workspaceId beramiz.
const READ_OPS = new Set<string>([
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
]);

const WHERE_WRITE_OPS = new Set<string>([
  'updateMany',
  'deleteMany',
]);

function tenantExtension(base: PrismaClient) {
  return base.$extends({
    name: 'workspace-tenancy',
    query: {
      $allModels: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async $allOperations({ model, operation, args, query }: any) {
          const store = getTenant();
          // Kontekst yo'q (masalan seed / batch job) yoki tenant-model emas —
          // aralashmaymiz.
          if (!store?.workspaceId || !TENANT_MODELS.has(model)) {
            return query(args);
          }
          const workspaceId = store.workspaceId;

          if (READ_OPS.has(operation) || WHERE_WRITE_OPS.has(operation)) {
            args.where = { ...(args.where ?? {}), workspaceId };
          } else if (operation === 'create') {
            args.data = { workspaceId, ...args.data };
          } else if (operation === 'createMany') {
            const data = Array.isArray(args.data) ? args.data : [args.data];
            args.data = data.map((d: Record<string, unknown>) => ({ workspaceId, ...d }));
          }
          // findUnique/update/delete/upsert — atayin tegilmaydi (yuqoridagi izohga qarang)
          return query(args);
        },
      },
    },
  });
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly base = new PrismaClient();

  /**
   * Tenant-scoped mijoz. Service'lar SHUNI ishlatadi:
   *   this.prisma.client.purchase.findMany()
   * Kontekstda workspaceId bor bo'lsa — avtomatik filtrlanadi.
   */
  public readonly client = tenantExtension(this.base);

  async onModuleInit(): Promise<void> {
    await this.base.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.base.$disconnect();
  }

  /** Tenant filtrisiz to'g'ridan-to'g'ri mijoz (auth, workspace, konsolidatsiya). */
  get raw(): PrismaClient {
    return this.base;
  }
}
