import {
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { SupplierType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

registerEnumType(SupplierType, { name: 'SupplierType' });

@ObjectType()
export class Supplier {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field(() => SupplierType)
  type!: SupplierType; // RUSSIA | LOCAL

  /** Nechta kirim qilingan (tarix). */
  @Field(() => Int)
  purchasesCount!: number;

  /** Jami xarid qiymati (so'm). */
  @Field(() => Float)
  totalPurchasedUzs!: number;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateSupplierInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field(() => SupplierType)
  @IsEnum(SupplierType)
  type!: SupplierType;
}
