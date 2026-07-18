import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import {
  AddPaymentInput,
  CreateSaleInput,
  Payment,
  Sale,
} from './dto/sale.types';
import { SalesService } from './sales.service';

@Resolver(() => Sale)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class SalesResolver {
  constructor(private readonly salesService: SalesService) {}

  @Query(() => [Sale])
  sales(@CurrentWorkspace() workspaceId: string): Promise<Sale[]> {
    return this.salesService.list(workspaceId);
  }

  @Query(() => Sale)
  sale(
    @CurrentWorkspace() workspaceId: string,
    @Args('id') id: string,
  ): Promise<Sale> {
    return this.salesService.findOne(workspaceId, id);
  }

  @Mutation(() => Sale)
  createSale(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateSaleInput,
  ): Promise<Sale> {
    return this.salesService.create(workspaceId, input);
  }

  @Mutation(() => Payment)
  addPayment(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: AddPaymentInput,
  ): Promise<Payment> {
    return this.salesService.addPayment(workspaceId, input);
  }
}
