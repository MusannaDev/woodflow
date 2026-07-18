import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import { CreateTransferInput, StockTransfer } from './dto/transfer.types';
import { TransfersService } from './transfers.service';

@Resolver(() => StockTransfer)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class TransfersResolver {
  constructor(private readonly transfersService: TransfersService) {}

  @Query(() => [StockTransfer])
  transfers(@CurrentWorkspace() workspaceId: string): Promise<StockTransfer[]> {
    return this.transfersService.list(workspaceId);
  }

  @Mutation(() => StockTransfer)
  createTransfer(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateTransferInput,
  ): Promise<StockTransfer> {
    return this.transfersService.create(workspaceId, input);
  }
}
