import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentInput, Shipment } from './dto/shipment.types';

type ShipmentRow = {
  id: string;
  truckNumber: string;
  truckColor: string | null;
  ownerName: string;
  ownerPhone: string | null;
  arrivalDate: Date;
  transportCost: Prisma.Decimal;
  customsCost: Prisma.Decimal;
  createdAt: Date;
};

@Injectable()
export class ShipmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(workspaceId: string): Promise<Shipment[]> {
    const rows = await this.prisma.client.shipment.findMany({
      where: { workspaceId },
      orderBy: { arrivalDate: 'desc' },
    });
    return rows.map(ShipmentsService.toGql);
  }

  async findOne(workspaceId: string, id: string): Promise<Shipment> {
    const row = await this.prisma.client.shipment.findFirst({
      where: { id, workspaceId },
    });
    if (!row) {
      throw new NotFoundException('Fura topilmadi.');
    }
    return ShipmentsService.toGql(row);
  }

  async create(
    workspaceId: string,
    input: CreateShipmentInput,
  ): Promise<Shipment> {
    const row = await this.prisma.client.shipment.create({
      data: {
        workspaceId,
        truckNumber: input.truckNumber,
        truckColor: input.truckColor,
        ownerName: input.ownerName,
        ownerPhone: input.ownerPhone,
        arrivalDate: input.arrivalDate,
        transportCost: new Prisma.Decimal(input.transportCost ?? 0),
        customsCost: new Prisma.Decimal(input.customsCost ?? 0),
      },
    });
    return ShipmentsService.toGql(row);
  }

  private static toGql(row: ShipmentRow): Shipment {
    return {
      id: row.id,
      truckNumber: row.truckNumber,
      truckColor: row.truckColor,
      ownerName: row.ownerName,
      ownerPhone: row.ownerPhone,
      arrivalDate: row.arrivalDate,
      transportCost: row.transportCost.toNumber(),
      customsCost: row.customsCost.toNumber(),
      createdAt: row.createdAt,
    };
  }
}
