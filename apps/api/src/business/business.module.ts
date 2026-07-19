import { Module } from '@nestjs/common';
import { BusinessResolver } from './business.resolver';
import { BusinessService } from './business.service';
import { UploadController } from './upload.controller';

@Module({
  controllers: [UploadController],
  providers: [BusinessService, BusinessResolver],
  exports: [BusinessService],
})
export class BusinessModule {}
