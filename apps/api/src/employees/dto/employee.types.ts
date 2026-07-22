import {
  Field,
  Float,
  InputType,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { SalaryType } from '@prisma/client';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
} from 'class-validator';

registerEnumType(SalaryType, { name: 'SalaryType' });

@ObjectType()
export class Employee {
  @Field()
  id!: string;

  /** null = ikkala biznesga birga ishlaydi (umumiy). */
  @Field(() => String, { nullable: true })
  workspaceId!: string | null;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  phone!: string | null;

  @Field(() => String, { nullable: true })
  position!: string | null;

  @Field(() => Float)
  salaryAmount!: number;

  @Field(() => SalaryType)
  salaryType!: SalaryType;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class SalaryPayment {
  @Field()
  id!: string;

  @Field()
  employeeId!: string;

  @Field(() => String, { nullable: true })
  employeeName!: string | null;

  @Field(() => Float)
  amountUzs!: number;

  @Field()
  period!: string; // masalan "2026-07"

  @Field()
  date!: Date;

  @Field()
  status!: string; // PENDING | CONFIRMED

  @Field(() => Date, { nullable: true })
  confirmedAt!: Date | null;
}

@InputType()
export class CreateEmployeeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  phone?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  position?: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  salaryAmount!: number;

  @Field(() => SalaryType)
  @IsEnum(SalaryType)
  salaryType!: SalaryType;

  /** true = ikkala biznesga birga (workspaceId = null). */
  @Field({ nullable: true, defaultValue: false })
  @IsOptional()
  @IsBoolean()
  isShared?: boolean;
}

@InputType()
export class PaySalaryInput {
  @Field()
  @IsString()
  employeeId!: string;

  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  amountUzs!: number;

  /** "YYYY-MM" formatда, masalan "2026-07". */
  @Field()
  @Matches(/^\d{4}-\d{2}$/, { message: 'period "YYYY-MM" formatda bo‘lsin.' })
  period!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsDate()
  date?: Date;
}
