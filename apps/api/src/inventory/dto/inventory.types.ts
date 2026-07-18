import { Field, Float, Int, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { LotStatus } from '@prisma/client';
import { IsNumber, IsOptional, IsPositive, IsString, IsDate } from 'class-validator';

registerEnumType(LotStatus, { name: 'LotStatus' });

@ObjectType()
export class InventoryLot {
  @Field()
  id!: string;

  @Field()
  woodType!: string;

  @Field()
  grade!: string;

  @Field(() => Float)
  volumeM3Remaining!: number;

  @Field(() => Float)
  unitCostUzsPerM3!: number;

  @Field(() => LotStatus)
  status!: LotStatus;

  /** Lot qaysi kirimdan (import/mahalliy) kelgani. */
  @Field(() => String, { nullable: true })
  source!: string | null;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class InventorySummary {
  @Field(() => Float)
  totalRemainingM3!: number; // sotiladigan jami qoldiq

  @Field(() => Float)
  defectM3!: number; // nuqson (chiqarilgan)

  @Field(() => Int)
  lotCount!: number;
}

@ObjectType()
export class DefectRecord {
  @Field()
  id!: string;

  @Field()
  lotId!: string;

  @Field(() => Float)
  volumeM3!: number;

  @Field(() => String, { nullable: true })
  reason!: string | null;

  @Field()
  date!: Date;
}

@InputType()
export class RecordDefectInput {
  @Field()
  @IsString()
  lotId!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  volumeM3!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reason?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;
}
