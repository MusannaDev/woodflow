import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

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
