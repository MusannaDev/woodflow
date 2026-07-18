import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import {
  ExchangeRate,
  SetExchangeRateInput,
} from './dto/exchange-rate.types';
import { ExchangeRatesService } from './exchange-rates.service';

/** Kurs global — workspace guard kerak emas, faqat auth. */
@Resolver(() => ExchangeRate)
@UseGuards(GqlAuthGuard)
export class ExchangeRatesResolver {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Query(() => ExchangeRate)
  latestExchangeRate(
    @Args('date', { nullable: true }) date?: Date,
  ): Promise<ExchangeRate> {
    return this.exchangeRatesService.latest(date);
  }

  @Query(() => [ExchangeRate])
  exchangeRates(): Promise<ExchangeRate[]> {
    return this.exchangeRatesService.list();
  }

  @Mutation(() => ExchangeRate)
  setExchangeRate(
    @Args('input') input: SetExchangeRateInput,
  ): Promise<ExchangeRate> {
    return this.exchangeRatesService.set(input);
  }
}
