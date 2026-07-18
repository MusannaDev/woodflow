import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { ExpensesModule } from './expenses/expenses.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductionModule } from './production/production.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ReportsModule } from './reports/reports.module';
import { SalesModule } from './sales/sales.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      // GraphQL kontekstiga Express req/res ni uzatamiz (guard/interceptor uchun)
      context: ({ req, res }: { req: unknown; res: unknown }) => ({ req, res }),
    }),
    PrismaModule,
    AuthModule,
    ExpensesModule,
    ShipmentsModule,
    PurchasesModule,
    InventoryModule,
    SalesModule,
    ReportsModule,
    TransfersModule,
    ProductionModule,
  ],
})
export class AppModule {}
