import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import { CreatePurchaseInput, Purchase } from './dto/purchase.types';
import { PurchasesService } from './purchases.service';

@Resolver(() => Purchase)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class PurchasesResolver {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Query(() => [Purchase])
  purchases(@CurrentWorkspace() workspaceId: string): Promise<Purchase[]> {
    return this.purchasesService.list(workspaceId);
  }

  @Mutation(() => Purchase)
  createPurchase(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreatePurchaseInput,
  ): Promise<Purchase> {
    return this.purchasesService.create(workspaceId, input, user.userId);
  }
}
