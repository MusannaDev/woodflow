import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { shipmentPnl } from '../common/money/pnl.util';
import { getTenant } from '../common/tenant/tenant-context';
import { PrismaService } from '../prisma/prisma.service';
import { ConsolidatedReport, WorkspacePnl } from './dto/consolidation.types';
import { ShipmentPnl } from './dto/report.types';

/**
 * Hisobotlar. OOP qobiq: DB'dan raqamlarni yig'adi,
 * hisobning o'zini common/money/pnl.util.ts dagi TOZA funksiya qiladi.
 */
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async shipmentPnl(workspaceId: string, shipmentId: string): Promise<ShipmentPnl> {
    const shipment = await this.prisma.raw.shipment.findFirst({
      where: { id: shipmentId, workspaceId },
      select: {
        id: true,
        truckNumber: true,
        transportCost: true,
        customsCost: true,
      },
    });
    if (!shipment) {
      throw new NotFoundException('Fura topilmadi.');
    }

    // Shu fura lotlaridan sotilgan qatorlar (lot tannarxi bilan)
    const soldItems = await this.prisma.raw.saleItem.findMany({
      where: { lot: { purchase: { shipmentId } } },
      select: {
        volumeM3: true,
        lineTotalUzs: true,
        lot: { select: { unitCostUzsPerM3: true } },
      },
    });

    // Shu fura lotlaridagi nuqson yozuvlari (lot tannarxi bilan)
    const defects = await this.prisma.raw.defectRecord.findMany({
      where: { lot: { purchase: { shipmentId } } },
      select: {
        volumeM3: true,
        lot: { select: { unitCostUzsPerM3: true } },
      },
    });

    let salesUzs = new Decimal(0);
    let soldCostUzs = new Decimal(0);
    let soldVolumeM3 = new Decimal(0);
    for (const item of soldItems) {
      // Fura P&L — faqat xomashyo lotidan sotilganlar (lot bo'yicha filtrlangan)
      if (!item.lot) continue;
      salesUzs = salesUzs.plus(item.lineTotalUzs.toString());
      const vol = new Decimal(item.volumeM3.toString());
      soldVolumeM3 = soldVolumeM3.plus(vol);
      soldCostUzs = soldCostUzs.plus(vol.mul(item.lot.unitCostUzsPerM3.toString()));
    }

    let defectLossUzs = new Decimal(0);
    let defectVolumeM3 = new Decimal(0);
    for (const d of defects) {
      if (!d.lot) continue;
      const vol = new Decimal(d.volumeM3.toString());
      defectVolumeM3 = defectVolumeM3.plus(vol);
      defectLossUzs = defectLossUzs.plus(vol.mul(d.lot.unitCostUzsPerM3.toString()));
    }

    // Sof hisob — toza funksiyada
    const pnl = shipmentPnl({
      salesUzs,
      soldCostUzs,
      transportUzs: shipment.transportCost.toString(),
      customsUzs: shipment.customsCost.toString(),
      defectLossUzs,
    });

    return {
      shipmentId: shipment.id,
      truckNumber: shipment.truckNumber,
      salesUzs: pnl.salesUzs.toNumber(),
      soldCostUzs: pnl.soldCostUzs.toDecimalPlaces(2).toNumber(),
      transportUzs: pnl.transportUzs.toNumber(),
      customsUzs: pnl.customsUzs.toNumber(),
      defectLossUzs: pnl.defectLossUzs.toDecimalPlaces(2).toNumber(),
      netProfitUzs: pnl.netProfitUzs.toNumber(),
      soldVolumeM3: soldVolumeM3.toNumber(),
      defectVolumeM3: defectVolumeM3.toNumber(),
    };
  }

  /**
   * Konsolidatsiya (System Design §9.1) — faqat OWNER.
   * Foydalanuvchi OWNER bo'lgan barcha workspace'lar bo'yicha:
   *   sof foyda = savdo + ichki transfer daromadi − sotilgan tannarx − xarajat
   * Umumiy (workspaceId=null) xarajatlar workspace'larga TENG taqsimlanadi.
   */
  async consolidatedReport(): Promise<ConsolidatedReport> {
    const tenant = getTenant();
    if (tenant?.role !== 'OWNER') {
      throw new ForbiddenException('Konsolidatsiya faqat egaga (OWNER) ochiq.');
    }

    const memberships = await this.prisma.raw.membership.findMany({
      where: { userId: tenant.userId ?? '', role: 'OWNER' },
      include: { workspace: true },
    });
    if (memberships.length === 0) {
      throw new ForbiddenException('OWNER workspace topilmadi.');
    }
    const workspaces = memberships.map((m) => m.workspace);
    const wsIds = workspaces.map((w) => w.id);

    // Umumiy xarajatlar — teng taqsim
    const sharedAgg = await this.prisma.raw.expense.aggregate({
      where: { workspaceId: null },
      _sum: { amountUzs: true },
    });
    const sharedTotal = new Decimal(sharedAgg._sum.amountUzs?.toString() ?? 0);
    const sharedPerWs = sharedTotal.div(wsIds.length);

    const result: WorkspacePnl[] = [];
    for (const ws of workspaces) {
      const [salesAgg, ownExpenseAgg, transferInAgg, soldItems] =
        await Promise.all([
          this.prisma.raw.sale.aggregate({
            where: { workspaceId: ws.id },
            _sum: { totalPriceUzs: true },
          }),
          this.prisma.raw.expense.aggregate({
            where: { workspaceId: ws.id },
            _sum: { amountUzs: true },
          }),
          this.prisma.raw.ledgerEntry.aggregate({
            where: { workspaceId: ws.id, type: 'TRANSFER_IN' },
            _sum: { amountUzs: true },
          }),
          this.prisma.raw.saleItem.findMany({
            where: { sale: { workspaceId: ws.id } },
            select: {
              volumeM3: true,
              quantity: true,
              lot: { select: { unitCostUzsPerM3: true } },
              finishedLot: { select: { unitCostUzsPerPiece: true } },
            },
          }),
        ]);

      const salesUzs = new Decimal(salesAgg._sum.totalPriceUzs?.toString() ?? 0);
      const transferInUzs = new Decimal(
        transferInAgg._sum.amountUzs?.toString() ?? 0,
      );
      let soldCostUzs = new Decimal(0);
      for (const item of soldItems) {
        if (item.lot) {
          // Xomashyo savdosi: m³ × tannarx/m³
          soldCostUzs = soldCostUzs.plus(
            new Decimal(item.volumeM3.toString()).mul(
              item.lot.unitCostUzsPerM3.toString(),
            ),
          );
        } else if (item.finishedLot) {
          // Tayyor mahsulot savdosi: dona × tannarx/dona
          soldCostUzs = soldCostUzs.plus(
            new Decimal(item.finishedLot.unitCostUzsPerPiece.toString()).mul(
              item.quantity,
            ),
          );
        }
      }
      const expensesUzs = new Decimal(
        ownExpenseAgg._sum.amountUzs?.toString() ?? 0,
      ).plus(sharedPerWs);

      const netProfitUzs = salesUzs
        .plus(transferInUzs)
        .minus(soldCostUzs)
        .minus(expensesUzs);

      result.push({
        workspaceId: ws.id,
        name: ws.name,
        type: ws.type,
        salesUzs: salesUzs.toNumber(),
        transferInUzs: transferInUzs.toNumber(),
        soldCostUzs: soldCostUzs.toDecimalPlaces(2).toNumber(),
        expensesUzs: expensesUzs.toDecimalPlaces(2).toNumber(),
        netProfitUzs: netProfitUzs.toDecimalPlaces(2).toNumber(),
      });
    }

    const sum = (fn: (w: WorkspacePnl) => number) =>
      result.reduce((acc, w) => acc.plus(fn(w)), new Decimal(0)).toNumber();

    return {
      workspaces: result,
      totalSalesUzs: sum((w) => w.salesUzs),
      totalExpensesUzs: sum((w) => w.expensesUzs),
      totalNetProfitUzs: sum((w) => w.netProfitUzs),
    };
  }
}
