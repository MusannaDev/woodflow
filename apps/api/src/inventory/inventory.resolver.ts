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
import {
  DefectRecord,
  InventoryLot,
  InventorySummary,
  RecordDefectInput,
} from './dto/inventory.types';
import { InventoryService } from './inventory.service';

@Resolver(() => InventoryLot)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Query(() => [InventoryLot])
  inventory(@CurrentWorkspace() workspaceId: string): Promise<InventoryLot[]> {
    return this.inventoryService.listLots(workspaceId);
  }

  @Query(() => InventorySummary)
  inventorySummary(
    @CurrentWorkspace() workspaceId: string,
  ): Promise<InventorySummary> {
    return this.inventoryService.summary(workspaceId);
  }

  @Mutation(() => DefectRecord)
  recordDefect(
    @CurrentWorkspace() workspaceId: string,
    @CurrentUser() user: AuthUser,
    @Args('input') input: RecordDefectInput,
  ): Promise<DefectRecord> {
    return this.inventoryService.recordDefect(workspaceId, input, user.userId);
  }
}
