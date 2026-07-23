import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ScheduleModule } from '@nestjs/schedule';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { BusinessModule } from './business/business.module';
import { NotificationsModule } from './notifications/notifications.module';
import { GqlAuthGuard } from './common/guards/gql-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CustomersModule } from './customers/customers.module';
import { EmployeesModule } from './employees/employees.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import { ExpensesModule } from './expenses/expenses.module';
import { InventoryModule } from './inventory/inventory.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductionModule } from './production/production.module';
import { PurchasesModule } from './purchases/purchases.module';
import { ReportsModule } from './reports/reports.module';
import { SalesModule } from './sales/sales.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    NotificationsModule,
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
    BusinessModule,
    ExpensesModule,
    ShipmentsModule,
    PurchasesModule,
    InventoryModule,
    SalesModule,
    ReportsModule,
    TransfersModule,
    ProductionModule,
    EmployeesModule,
    CustomersModule,
    SuppliersModule,
    ExchangeRatesModule,
  ],
  providers: [
    // GLOBAL guard zanjiri:
    // 1) AuthGuard — @Public() bo'lmasa JWT majburiy (WithoutGuard = @Public)
    // 2) RolesGuard — @Roles(...) bo'lsa rol tekshiriladi (masalan ADMIN, AGENT)
    { provide: APP_GUARD, useClass: GqlAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
