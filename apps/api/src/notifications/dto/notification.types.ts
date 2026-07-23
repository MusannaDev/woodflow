import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NotificationView {
  @Field()
  id!: string;

  @Field()
  type!: string;

  @Field()
  title!: string;

  @Field(() => String, { nullable: true })
  body!: string | null;

  @Field(() => String, { nullable: true })
  link!: string | null;

  @Field()
  read!: boolean;

  @Field()
  createdAt!: Date;
}
