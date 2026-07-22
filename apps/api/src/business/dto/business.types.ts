import { Field, Float, Int, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

@ObjectType()
export class JoinRequestView {
  @Field()
  id!: string;

  @Field()
  type!: string; // OWNER_SIGNUP | WORKER_JOIN

  @Field()
  status!: string;

  @Field()
  userName!: string;

  @Field()
  userPhone!: string;

  @Field(() => String, { nullable: true })
  businessName!: string | null;

  @Field(() => String, { nullable: true })
  employeeName!: string | null; // WORKER_JOIN'da mos ishchi yozuvi

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class BusinessView {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  logoUrl!: string | null;

  @Field()
  status!: string;
}

@InputType()
export class DecideRequestInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  requestId!: string;

  @Field()
  @IsBoolean()
  approve!: boolean;
}

@InputType()
export class UpdateBusinessInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;
}

// ─────────────────────── CEO panel ───────────────────────

@ObjectType()
export class PlatformStatsView {
  @Field(() => Int)
  ownerCount!: number; // ACTIVE bizneslar (egalar)

  @Field(() => Int)
  pendingCount!: number; // tasdiq kutayotgan bizneslar

  @Field(() => Int)
  userCount!: number; // platformadagi barcha userlar

  @Field(() => Int)
  workerCount!: number; // ishchi a'zoligi bor userlar
}

@ObjectType()
export class OwnerView {
  @Field()
  userId!: string;

  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  businessId!: string;

  @Field()
  businessName!: string;

  @Field()
  status!: string; // ACTIVE | PENDING | REJECTED

  @Field()
  kind!: string; // WOOD_ONLY | LUMBER_ONLY | BOTH

  @Field()
  freeAccess!: boolean;

  @Field()
  blocked!: boolean; // obuna tugagan + tekin ruxsat yo'q

  @Field(() => Date, { nullable: true })
  paidUntil!: Date | null;

  @Field(() => String, { nullable: true })
  logoUrl!: string | null;

  @Field(() => Int)
  workspaceCount!: number;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class PlatformUserView {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  platformRole!: string; // CEO | USER

  @Field()
  roleLabel!: string; // CEO | Owner | Ishchi | —

  @Field(() => String, { nullable: true })
  businessName!: string | null;

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class WsInfo {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;
}

@ObjectType()
export class OwnerDetailView {
  @Field()
  userId!: string;

  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  businessId!: string;

  @Field()
  businessName!: string;

  @Field()
  status!: string;

  @Field()
  kind!: string;

  @Field()
  freeAccess!: boolean;

  @Field()
  blocked!: boolean;

  @Field(() => Date, { nullable: true })
  paidUntil!: Date | null;

  @Field(() => String, { nullable: true })
  logoUrl!: string | null;

  @Field(() => Int)
  employeeCount!: number;

  @Field()
  createdAt!: Date;

  @Field(() => [WsInfo])
  workspaces!: WsInfo[];

  @Field(() => [PlatformPaymentView])
  payments!: PlatformPaymentView[];
}

@ObjectType()
export class MembershipInfo {
  @Field()
  workspaceName!: string;

  @Field(() => String, { nullable: true })
  businessName!: string | null;

  @Field()
  role!: string;
}

@ObjectType()
export class UserDetailView {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  phone!: string;

  @Field()
  platformRole!: string;

  @Field()
  roleLabel!: string;

  @Field(() => String, { nullable: true })
  ownedBusinessName!: string | null;

  @Field()
  createdAt!: Date;

  @Field(() => [MembershipInfo])
  memberships!: MembershipInfo[];
}

@InputType()
export class CreateOwnerInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Field()
  @IsString()
  @MinLength(4)
  password!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  // WOOD_ONLY | LUMBER_ONLY | BOTH (bo'sh = BOTH)
  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['WOOD_ONLY', 'LUMBER_ONLY', 'BOTH'])
  kind?: 'WOOD_ONLY' | 'LUMBER_ONLY' | 'BOTH';
}

@InputType()
export class UpdateOwnerInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  businessName!: string;

  // Ixtiyoriy — kiritilsa parol yangilanadi
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MinLength(4)
  newPassword?: string;
}

// ─────────────────── Platforma to'lovi (obuna) ───────────────────

@ObjectType()
export class PlatformPaymentView {
  @Field()
  id!: string;

  @Field()
  businessId!: string;

  @Field(() => String, { nullable: true })
  businessName!: string | null;

  @Field(() => String, { nullable: true })
  ownerName!: string | null;

  @Field(() => Float)
  amountUzs!: number;

  @Field(() => Int)
  months!: number;

  @Field(() => String, { nullable: true })
  note!: string | null;

  @Field(() => String, { nullable: true })
  receiptUrl!: string | null;

  @Field()
  status!: string; // PENDING | APPROVED | REJECTED

  @Field()
  createdAt!: Date;
}

@ObjectType()
export class MyBillingView {
  @Field()
  status!: string; // biznes holati

  @Field()
  blocked!: boolean;

  @Field()
  freeAccess!: boolean;

  @Field(() => Date, { nullable: true })
  paidUntil!: Date | null;

  @Field(() => [PlatformPaymentView])
  payments!: PlatformPaymentView[];
}

@InputType()
export class SubmitPaymentInput {
  @Field(() => Float)
  @IsNumber()
  @IsPositive()
  amountUzs!: number;

  @Field(() => Int)
  @IsInt()
  @Min(1)
  months!: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  note?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

@InputType()
export class DecidePaymentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  paymentId!: string;

  @Field()
  @IsBoolean()
  approve!: boolean;
}

@InputType()
export class GrantAccessInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  businessId!: string;

  @Field()
  @IsBoolean()
  freeAccess!: boolean;
}
