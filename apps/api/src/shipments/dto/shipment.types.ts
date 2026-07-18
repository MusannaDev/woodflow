import { Field, Float, InputType, ObjectType } from '@nestjs/graphql';
import {
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

@ObjectType()
export class Shipment {
  @Field()
  id!: string;

  @Field()
  truckNumber!: string;

  @Field(() => String, { nullable: true })
  truckColor!: string | null;

  @Field()
  ownerName!: string;

  @Field(() => String, { nullable: true })
  ownerPhone!: string | null;

  @Field()
  arrivalDate!: Date;

  @Field(() => Float)
  transportCost!: number; // so'm

  @Field(() => Float)
  customsCost!: number; // so'm (bojxona)

  @Field()
  createdAt!: Date;
}

@InputType()
export class CreateShipmentInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  truckNumber!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  truckColor?: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  ownerName!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  ownerPhone?: string;

  @Field()
  @IsDate()
  arrivalDate!: Date;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  transportCost?: number;

  @Field(() => Float, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  customsCost?: number;
}
