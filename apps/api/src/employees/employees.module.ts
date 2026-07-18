import { Module } from '@nestjs/common';
import { EmployeesResolver } from './employees.resolver';
import { EmployeesService } from './employees.service';

@Module({
  providers: [EmployeesService, EmployeesResolver],
  exports: [EmployeesService],
})
export class EmployeesModule {}
