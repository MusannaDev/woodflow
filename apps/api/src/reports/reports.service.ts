import { Injectable, NotFoundException } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { shipmentPnl } from '../common/money/pnl.util';
import { PrismaService } from '../prisma/prisma.service';
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
      salesUzs = salesUzs.plus(item.lineTotalUzs.toString());
      const vol = new Decimal(item.volumeM3.toString());
      soldVolumeM3 = soldVolumeM3.plus(vol);
      soldCostUzs = soldCostUzs.plus(vol.mul(item.lot.unitCostUzsPerM3.toString()));
    }

    let defectLossUzs = new Decimal(0);
    let defectVolumeM3 = new Decimal(0);
    for (const d of defects) {
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
}
