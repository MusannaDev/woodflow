import { Module } from '@nestjs/common';
import { ProductionResolver } from './production.resolver';
import { ProductionService } from './production.service';

@Module({
  providers: [ProductionService, ProductionResolver],
  exports: [ProductionService],
})
export class ProductionModule {}
