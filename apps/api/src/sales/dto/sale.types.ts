import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { Currency, SaleType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';

registerEnumType(SaleType, { name: 'SaleType' });

// ─────────────── OUTPUT ───────────────

@ObjectType()
export class SaleItem {
  @Field()
  id!: string;

  @Field()
  lotId!: string;

  @Field(() => Int)
  quantity!: number;

  @Field(() => Float)
  length!: number;

  @Field(() => Float)
  width!: number;

  @Field(() => Float)
  thickness!: number;

  @Field(() => Float)
  volumeM3!: number; // avto: L×W×T×qty

  @Field(() => Float)
  unitPriceUzs!: number;

  @Field(() => Float)
  lineTotalUzs!: number;
}

@ObjectType()
export class Payment {
  @Field()
  id!: string;

  @Field(() => Float)
  amount!: number; // asl valyutada

  @Field(() => Currency)
  currency!: Currency;

  @Field(() => Float)
  exchangeRate!: number;

  @Field(() => Float)
  amountUzs!: number;

  @Field()
  date!: Date;
}

@ObjectType()
export class Sale {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  customerId!: string | null;

  @Field(() => SaleType)
  saleType!: SaleType;

  @Field(() => Float)
  totalPriceUzs!: number;

  @Field(() => Float)
  paidUzs!: number; // to'langan jami (so'mda)

  @Field(() => Float)
  debtUzs!: number; // qarz = total − paid

  @Field()
  date!: Date;

  @Field(() => [SaleItem])
  items!: SaleItem[];

  @Field(() => [Payment])
  payments!: Payment[];

  @Field()
  createdAt!: Date;
}

// ─────────────── INPUT ───────────────

@InputType()
export class SaleItemInput {
  @Field()
  @IsString()
  lotId!: string;

  @Field(() => Int)
  @IsInt()
  @IsPositive()
  quantity!: number;

  /** O'lcham metrda: 6.0 × 0.2 × 0.05 */
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

  /** PER_PIECE'da — dona narxi; PER_CUBE/WHOLESALE'da — m³ narxi (so'm). */
  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  unitPriceUzs!: number;
}

@InputType()
export class CreateSaleInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  customerId?: string;

  @Field(() => SaleType)
  @IsEnum(SaleType)
  saleType!: SaleType;

  @Field()
  @IsDate()
  date!: Date;

  @Field(() => [SaleItemInput])
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SaleItemInput)
  items!: SaleItemInput[];
}

@InputType()
export class AddPaymentInput {
  @Field()
  @IsString()
  saleId!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  amount!: number;

  @Field(() => Currency)
  @IsEnum(Currency)
  currency!: Currency; // UZS | USD

  /** USD uchun majburiy (qabul kuni kursi). UZS'da e'tiborsiz. */
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  exchangeRate?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;
}
