import { Module } from '@nestjs/common';
import { ShipmentsResolver } from './shipments.resolver';
import { ShipmentsService } from './shipments.service';

@Module({
  providers: [ShipmentsService, ShipmentsResolver],
  exports: [ShipmentsService],
})
export class ShipmentsModule {}
