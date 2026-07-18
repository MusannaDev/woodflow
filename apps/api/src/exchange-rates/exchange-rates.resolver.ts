import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ExchangeRate,
  SetExchangeRateInput,
} from './dto/exchange-rate.types';
import { ExchangeRatesService } from './exchange-rates.service';

/** Kurs global. Auth — global guard orqali; kiritish esa RoleGuard bilan. */
@Resolver(() => ExchangeRate)
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

  /** RoleGuard: kursni faqat boshqaruv (OWNER/ADMIN/AGENT) kiritadi. */
  @Roles(Role.OWNER, Role.ADMIN, Role.AGENT)
  @Mutation(() => ExchangeRate)
  setExchangeRate(
    @Args('input') input: SetExchangeRateInput,
  ): Promise<ExchangeRate> {
    return this.exchangeRatesService.set(input);
  }
}
