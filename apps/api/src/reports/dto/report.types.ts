import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class ShipmentPnl {
  @Field()
  shipmentId!: string;

  @Field()
  truckNumber!: string;

  /** Shu fura lotlaridan sotilgan jami savdo (so'm). */
  @Field(() => Float)
  salesUzs!: number;

  /** Sotilgan hajmning tannarxi (sotilgan m³ × tannarx/m³). */
  @Field(() => Float)
  soldCostUzs!: number;

  @Field(() => Float)
  transportUzs!: number;

  @Field(() => Float)
  customsUzs!: number;

  /** Nuqson zarari (nuqson m³ × tannarx/m³). */
  @Field(() => Float)
  defectLossUzs!: number;

  /** Sof foyda = savdo − tannarx − transport − bojxona − nuqson. */
  @Field(() => Float)
  netProfitUzs!: number;

  /** Sotilgan hajm (m³) — ma'lumot uchun. */
  @Field(() => Float)
  soldVolumeM3!: number;

  /** Nuqson hajmi (m³). */
  @Field(() => Float)
  defectVolumeM3!: number;
}
