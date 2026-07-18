import { Module } from '@nestjs/common';
import { SuppliersResolver } from './suppliers.resolver';
import { SuppliersService } from './suppliers.service';

@Module({
  providers: [SuppliersService, SuppliersResolver],
  exports: [SuppliersService],
})
export class SuppliersModule {}
