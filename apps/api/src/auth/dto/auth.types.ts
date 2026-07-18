import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

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
export class AuthPayload {
  @Field()
  token!: string;

  @Field()
  userId!: string;

  @Field()
  name!: string;

  /** Foydalanuvchi a'zo bo'lgan workspace'lar — login'dan keyin tanlash uchun. */
  @Field(() => [WorkspaceBrief])
  workspaces!: WorkspaceBrief[];
}
