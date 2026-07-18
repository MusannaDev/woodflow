import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

// ─────────────── SHABLON ───────────────

@ObjectType()
export class ProductTemplate {
  @Field()
  id!: string;

  @Field()
  name!: string; // Pol taxta, Rika...

  @Field(() => Float)
  length!: number;

  @Field(() => Float)
  width!: number;

  @Field(() => Float)
  thickness!: number;

  @Field(() => Float)
  volumePerPiece!: number; // avto = L×W×T

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateProductTemplateInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  length!: number;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  width!: number;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  thickness!: number;
}

// ─────────────── PARTIYA ───────────────

@ObjectType()
export class ProductionBatch {
  @Field()
  id!: string;

  @Field()
  date!: Date;

  @Field(() => String, { nullable: true })
  inputLotId!: string | null;

  @Field(() => Float)
  inputVolumeM3!: number;

  @Field(() => String, { nullable: true })
  outputProductId!: string | null;

  @Field(() => Int)
  outputQuantity!: number;

  @Field(() => Float)
  outputVolumeM3!: number; // dona × shablon hajmi

  @Field(() => Float)
  yieldPercent!: number; // chiqim %

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateProductionBatchInput {
  /** Xomashyo lot (2-biznes omboridan, odatda ichki transferdan kelgan). */
  @Field()
  @IsString()
  inputLotId!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  inputVolumeM3!: number;

  @Field()
  @IsString()
  outputProductId!: string;

  @Field(() => Int)
  @IsInt()
  @IsPositive()
  outputQuantity!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;
}

// ─────────────── TAYYOR OMBOR ───────────────

@ObjectType()
export class FinishedGoodsLot {
  @Field()
  id!: string;

  @Field()
  productId!: string;

  @Field()
  productName!: string;

  @Field(() => String, { nullable: true })
  batchId!: string | null;

  @Field(() => Int)
  quantityRemaining!: number;

  @Field(() => Float)
  unitCostUzsPerPiece!: number;

  @Field()
  createdAt!: Date;
}
