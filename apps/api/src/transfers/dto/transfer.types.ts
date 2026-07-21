import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import {
  IsDate,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

@ObjectType()
export class StockTransfer {
  @Field()
  id!: string;

  @Field()
  fromWorkspaceId!: string;

  @Field()
  toWorkspaceId!: string;

  @Field()
  lotId!: string; // manba lot (1-biznes)

  @Field(() => Float)
  volumeM3!: number;

  @Field(() => Int, { nullable: true })
  quantity!: number | null; // dona (ixtiyoriy)

  @Field(() => Float)
  internalPriceUzs!: number; // JAMI ichki narx (so'm)

  @Field()
  date!: Date;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateTransferInput {
  /** Qabul qiluvchi workspace (2-biznes). */
  @Field()
  @IsString()
  toWorkspaceId!: string;

  /** Manba lot — joriy (yuboruvchi) workspace'niki. */
  @Field()
  @IsString()
  lotId!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  volumeM3!: number;

  /** Dona (ixtiyoriy) — manba lotdan ayirilib, qabul lotiga o'tadi. */
  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @IsPositive()
  quantity?: number;

  /** JAMI ichki narx so'mda (1-biznesga daromad, 2-biznesga xarajat). */
  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  internalPriceUzs!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;
}
