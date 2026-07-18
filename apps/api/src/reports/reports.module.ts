import { Module } from '@nestjs/common';
import { ReportsResolver } from './reports.resolver';
import { ReportsService } from './reports.service';

@Module({
  providers: [ReportsService, ReportsResolver],
  exports: [ReportsService],
})
export class ReportsModule {}
