import { Field, Float, InputType, Int, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@ObjectType()
export class Customer {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  /** Nechta savdo qilingan (tarix). */
  @Field(() => Int)
  salesCount!: number;

  /** Joriy qarz balansi (so'm) — barcha savdolari bo'yicha. */
  @Field(() => Float)
  debtUzs!: number;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateCustomerInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;
}
