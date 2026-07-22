import { Field, InputType, ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsIn, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class LoginInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @Field()
  @IsString()
  @MinLength(4)
  password!: string;
}

@InputType()
export class RegisterInput {
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
  @MinLength(6, { message: 'Parol kamida 6 belgi bo‘lsin.' })
  password!: string;

  /** OWNER — biznes egasi (CEO tasdiqlaydi); WORKER — ishchi (egasi tasdiqlaydi). */
  @Field()
  @IsIn(['OWNER', 'WORKER'], { message: 'accountType OWNER yoki WORKER bo‘lsin.' })
  accountType!: 'OWNER' | 'WORKER';

  /** OWNER uchun majburiy — biznes nomi. */
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  businessName?: string;

  /** OWNER uchun — qaysi makon(lar): WOOD_ONLY | LUMBER_ONLY | BOTH. */
  @Field({ nullable: true })
  @IsOptional()
  @IsIn(['WOOD_ONLY', 'LUMBER_ONLY', 'BOTH'], {
    message: 'businessKind WOOD_ONLY, LUMBER_ONLY yoki BOTH bo‘lsin.',
  })
  businessKind?: 'WOOD_ONLY' | 'LUMBER_ONLY' | 'BOTH';
}

@ObjectType()
export class WorkspaceBrief {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;

  @Field()
  role!: string;
}

@ObjectType()
export class BusinessBrief {
  @Field()
  id!: string;

  @Field()
  name!: string;

  @Field(() => String, { nullable: true })
  logoUrl!: string | null;

  @Field()
  status!: string; // PENDING | ACTIVE | REJECTED

  /** Platforma obunasi tugagan va tekin ruxsat yo'q — faqat /tolov ochiq. */
  @Field()
  blocked!: boolean;

  /** Obuna qachongacha ochiq (null = hali to'lanmagan). */
  @Field(() => Date, { nullable: true })
  paidUntil!: Date | null;

  /** CEO tekin ruxsat berganmi. */
  @Field()
  freeAccess!: boolean;
}

@ObjectType()
export class AuthPayload {
  @Field()
  token!: string;

  @Field()
  userId!: string;

  @Field()
  name!: string;

  @Field()
  platformRole!: string; // CEO | USER

  /** Foydalanuvchi a'zo bo'lgan workspace'lar (tasdiqlangach to'ladi). */
  @Field(() => [WorkspaceBrief])
  workspaces!: WorkspaceBrief[];

  /** Bog'liq biznes (egasi bo'lsa yoki ishchi bo'lsa). */
  @Field(() => BusinessBrief, { nullable: true })
  business!: BusinessBrief | null;

  /**
   * Kutish holati:
   *  CEO_APPROVAL — biznes CEO tasdig'ini kutmoqda
   *  OWNER_APPROVAL — ishchi so'rovi egasi tasdig'ini kutmoqda
   *  WAITING_EMPLOYEE — egasi hali ishchi yozuvini yaratmagan
   *  null — kutish yo'q, kirish ochiq
   */
  @Field(() => String, { nullable: true })
  pending!: string | null;
}
