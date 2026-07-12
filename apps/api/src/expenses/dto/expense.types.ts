import { Field, Float, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ExpenseCategory } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator';

registerEnumType(ExpenseCategory, { name: 'ExpenseCategory' });

@ObjectType()
export class Expense {
  @Field()
  id!: string;

  @Field(() => String, { nullable: true })
  workspaceId!: string | null; // null = umumiy

  @Field(() => ExpenseCategory)
  category!: ExpenseCategory;

  @Field(() => Float)
  amountUzs!: number;

  @Field()
  date!: Date;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => String, { nullable: true })
  employeeId!: string | null;

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateExpenseInput {
  @Field(() => ExpenseCategory)
  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  amountUzs!: number;

  @Field()
  @IsDate()
  date!: Date;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  employeeId?: string;

  /** true = umumiy xarajat (ikki biznesga tegishli, workspaceId = null). */
  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}
