import { Module } from '@nestjs/common';
import { ExchangeRatesResolver } from './exchange-rates.resolver';
import { ExchangeRatesService } from './exchange-rates.service';

@Module({
  providers: [ExchangeRatesService, ExchangeRatesResolver],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
