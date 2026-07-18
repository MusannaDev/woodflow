import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { volumePerPiece, yieldPercent } from '../common/money/uom.util';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProductionBatchInput,
  CreateProductTemplateInput,
  FinishedGoodsLot,
  ProductionBatch,
  ProductTemplate,
} from './dto/production.types';

@Injectable()
export class ProductionService {
  constructor(private readonly prisma: PrismaService) {}

  // ─────────────── SHABLONLAR ───────────────

  async listTemplates(workspaceId: string): Promise<ProductTemplate[]> {
    const rows = await this.prisma.client.productTemplate.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((t) => ({
      id: t.id,
      name: t.name,
      length: t.length.toNumber(),
      width: t.width.toNumber(),
      thickness: t.thickness.toNumber(),
      volumePerPiece: t.volumePerPiece.toNumber(),
      createdAt: t.createdAt,
    }));
  }

  async createTemplate(
    workspaceId: string,
    input: CreateProductTemplateInput,
  ): Promise<ProductTemplate> {
    const vpp = volumePerPiece({
      length: input.length,
      width: input.width,
      thickness: input.thickness,
    });
    const row = await this.prisma.client.productTemplate.create({
      data: {
        workspaceId,
        name: input.name,
        length: new Prisma.Decimal(input.length),
        width: new Prisma.Decimal(input.width),
        thickness: new Prisma.Decimal(input.thickness),
        volumePerPiece: new Prisma.Decimal(vpp.toString()),
      },
    });
    return {
      id: row.id,
      name: row.name,
      length: row.length.toNumber(),
      width: row.width.toNumber(),
      thickness: row.thickness.toNumber(),
      volumePerPiece: row.volumePerPiece.toNumber(),
      createdAt: row.createdAt,
    };
  }

  // ─────────────── PARTIYALAR ───────────────

  async listBatches(workspaceId: string): Promise<ProductionBatch[]> {
    const rows = await this.prisma.raw.productionBatch.findMany({
      where: { workspaceId },
      include: { outputProduct: { select: { volumePerPiece: true } } },
      orderBy: { date: 'desc' },
    });
    return rows.map((b) => ({
      id: b.id,
      date: b.date,
      inputLotId: b.inputLotId,
      inputVolumeM3: b.inputVolumeM3.toNumber(),
      outputProductId: b.outputProductId,
      outputQuantity: b.outputQuantity,
      outputVolumeM3: b.outputProduct
        ? new Decimal(b.outputProduct.volumePerPiece.toString())
            .mul(b.outputQuantity)
            .toDecimalPlaces(4)
            .toNumber()
        : 0,
      yieldPercent: b.yieldPercent.toNumber(),
      createdAt: b.createdAt,
    }));
  }

  /**
   * Ishlab chiqarish partiyasi (ATOMIK):
   *  1) xomashyo lot qoldig'ini tekshiradi va yechadi
   *  2) yield = (dona × shablon hajmi) / kirish hajmi × 100
   *  3) tayyor mahsulot lotini yaratadi
   *     (dona tannarxi = xomashyo qiymati / dona soni)
   */
  async createBatch(
    workspaceId: string,
    input: CreateProductionBatchInput,
  ): Promise<ProductionBatch> {
    const inputVol = new Decimal(input.inputVolumeM3);

    const result = await this.prisma.raw.$transaction(async (tx) => {
      const lot = await tx.inventoryLot.findFirst({
        where: { id: input.inputLotId, workspaceId },
        select: { id: true, volumeM3Remaining: true, unitCostUzsPerM3: true },
      });
      if (!lot) {
        throw new NotFoundException('Xomashyo lot topilmadi.');
      }
      if (inputVol.greaterThan(lot.volumeM3Remaining.toString())) {
        throw new BadRequestException(
          `Xomashyo yetarli emas: so‘ralgan ${inputVol} m³, qoldiq ${lot.volumeM3Remaining} m³.`,
        );
      }

      const product = await tx.productTemplate.findFirst({
        where: { id: input.outputProductId, workspaceId },
        select: { id: true, volumePerPiece: true },
      });
      if (!product) {
        throw new NotFoundException('Mahsulot shabloni topilmadi.');
      }

      const outputVol = new Decimal(product.volumePerPiece.toString()).mul(
        input.outputQuantity,
      );
      if (outputVol.greaterThan(inputVol)) {
        throw new BadRequestException(
          `Chiqish hajmi (${outputVol.toFixed(4)} m³) kirish hajmidan (${inputVol} m³) katta bo‘lishi mumkin emas.`,
        );
      }
      const yieldPct = yieldPercent(inputVol, outputVol);

      // Xomashyo tannarxi → dona tannarxi
      const inputCost = inputVol.mul(lot.unitCostUzsPerM3.toString());
      const unitCostPerPiece = inputCost
        .div(input.outputQuantity)
        .toDecimalPlaces(2);

      // 1) xomashyodan yechish
      await tx.inventoryLot.update({
        where: { id: lot.id },
        data: { volumeM3Remaining: { decrement: new Prisma.Decimal(inputVol.toString()) } },
      });

      // 2) partiya
      const batch = await tx.productionBatch.create({
        data: {
          workspaceId,
          date: input.date ?? new Date(),
          inputLotId: lot.id,
          inputVolumeM3: new Prisma.Decimal(inputVol.toString()),
          outputProductId: product.id,
          outputQuantity: input.outputQuantity,
          yieldPercent: new Prisma.Decimal(yieldPct.toString()),
        },
      });

      // 3) tayyor mahsulot lot
      await tx.finishedGoodsLot.create({
        data: {
          workspaceId,
          productId: product.id,
          batchId: batch.id,
          quantityRemaining: input.outputQuantity,
          unitCostUzsPerPiece: new Prisma.Decimal(unitCostPerPiece.toString()),
        },
      });

      return { batch, outputVol, yieldPct };
    });

    return {
      id: result.batch.id,
      date: result.batch.date,
      inputLotId: result.batch.inputLotId,
      inputVolumeM3: result.batch.inputVolumeM3.toNumber(),
      outputProductId: result.batch.outputProductId,
      outputQuantity: result.batch.outputQuantity,
      outputVolumeM3: result.outputVol.toDecimalPlaces(4).toNumber(),
      yieldPercent: result.yieldPct.toNumber(),
      createdAt: result.batch.createdAt,
    };
  }

  // ─────────────── TAYYOR OMBOR ───────────────

  async listFinishedGoods(workspaceId: string): Promise<FinishedGoodsLot[]> {
    const rows = await this.prisma.raw.finishedGoodsLot.findMany({
      where: { workspaceId },
      include: { product: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((f) => ({
      id: f.id,
      productId: f.productId,
      productName: f.product.name,
      batchId: f.batchId,
      quantityRemaining: f.quantityRemaining,
      unitCostUzsPerPiece: f.unitCostUzsPerPiece.toNumber(),
      createdAt: f.createdAt,
    }));
  }
}
