import { Field, Float, ObjectType } from '@nestjs/graphql';

/** Bitta workspace'ning P&L ko'rinishi (konsolidatsiya ichida). */
@ObjectType()
export class WorkspacePnl {
  @Field()
  workspaceId!: string;

  @Field()
  name!: string;

  @Field()
  type!: string;

  /** Tashqi savdo tushumi (so'm). */
  @Field(() => Float)
  salesUzs!: number;

  /** Ichki transferdan daromad (1-biznesda bo'ladi). */
  @Field(() => Float)
  transferInUzs!: number;

  /** Sotilgan hajm tannarxi. */
  @Field(() => Float)
  soldCostUzs!: number;

  /** Xarajatlar: o'ziniki + umumiyning ulushi (teng taqsim). */
  @Field(() => Float)
  expensesUzs!: number;

  /** Sof foyda = savdo + transfer daromad − tannarx − xarajat. */
  @Field(() => Float)
  netProfitUzs!: number;
}

/** Egaga umumiy ko'rinish: ikkala biznes birga. */
@ObjectType()
export class ConsolidatedReport {
  @Field(() => [WorkspacePnl])
  workspaces!: WorkspacePnl[];

  @Field(() => Float)
  totalSalesUzs!: number;

  @Field(() => Float)
  totalExpensesUzs!: number;

  @Field(() => Float)
  totalNetProfitUzs!: number;
}
