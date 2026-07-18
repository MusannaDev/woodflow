import { Module } from '@nestjs/common';
import { SalesResolver } from './sales.resolver';
import { SalesService } from './sales.service';

@Module({
  providers: [SalesService, SalesResolver],
  exports: [SalesService],
})
export class SalesModule {}
