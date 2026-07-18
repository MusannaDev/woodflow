import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import { IsDate, IsNumber, IsOptional, IsPositive } from 'class-validator';

@ObjectType()
export class ExchangeRate {
  @Field()
  id!: string;

  @Field()
  date!: Date;

  /** 1 RUB = X so'm. */
  @Field(() => Float)
  rubToUzs!: number;

  /** 1 USD = X so'm. */
  @Field(() => Float)
  usdToUzs!: number;
}

@InputType()
export class SetExchangeRateInput {
  /** Qaysi kun uchun (berilmasa — bugun). Kuniga bitta yozuv (upsert). */
  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  rubToUzs!: number;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  usdToUzs!: number;
}
