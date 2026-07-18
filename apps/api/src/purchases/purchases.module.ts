import { Module } from '@nestjs/common';
import { PurchasesResolver } from './purchases.resolver';
import { PurchasesService } from './purchases.service';

@Module({
  providers: [PurchasesService, PurchasesResolver],
  exports: [PurchasesService],
})
export class PurchasesModule {}
