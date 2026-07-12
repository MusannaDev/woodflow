import { Module } from '@nestjs/common';
import { ExpensesResolver } from './expenses.resolver';
import { ExpensesService } from './expenses.service';

@Module({
  providers: [ExpensesService, ExpensesResolver],
  exports: [ExpensesService],
})
export class ExpensesModule {}
