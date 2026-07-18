import { Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Currency, PurchaseSource } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsDate,
} from 'class-validator';

registerEnumType(PurchaseSource, { name: 'PurchaseSource' });
registerEnumType(Currency, { name: 'Currency' });

@ObjectType()
export class Purchase {
  @Field()
  id!: string;

  @Field(() => PurchaseSource)
  source!: PurchaseSource;

  @Field(() => String, { nullable: true })
  shipmentId!: string | null;

  @Field(() => String, { nullable: true })
  supplierId!: string | null;

  @Field()
  woodType!: string;

  @Field()
  grade!: string;

  @Field(() => Float)
  volumeM3!: number;

  @Field(() => Float)
  unitPrice!: number; // asl valyutada (RUB yoki UZS) / m³

  @Field(() => Currency)
  currency!: Currency;

  @Field(() => Float)
  exchangeRate!: number; // kirim kunida muzlatilgan

  @Field(() => Float)
  totalCostUzs!: number; // so'mga aylantirilgan jami tannarx

  @Field()
  date!: Date;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreatePurchaseInput {
  @Field(() => PurchaseSource)
  @IsEnum(PurchaseSource)
  source!: PurchaseSource;

  /** RUSSIA_IMPORT uchun majburiy (furaga bog'lanadi). */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  shipmentId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  woodType!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  grade!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  volumeM3!: number;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  unitPrice!: number;

  @Field(() => Currency)
  @IsEnum(Currency)
  currency!: Currency;

  /** RUSSIA_IMPORT uchun majburiy (RUB→so'm). LOCAL_WHOLESALE uchun e'tiborsiz. */
  @Field(() => Float, { nullable: true })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  exchangeRate?: number;

  @Field()
  @IsDate()
  date!: Date;
}
