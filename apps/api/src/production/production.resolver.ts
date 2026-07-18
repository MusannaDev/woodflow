import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import {
  CreateProductionBatchInput,
  CreateProductTemplateInput,
  FinishedGoodsLot,
  ProductionBatch,
  ProductTemplate,
} from './dto/production.types';
import { ProductionService } from './production.service';

@Resolver(() => ProductionBatch)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class ProductionResolver {
  constructor(private readonly productionService: ProductionService) {}

  @Query(() => [ProductTemplate])
  productTemplates(
    @CurrentWorkspace() workspaceId: string,
  ): Promise<ProductTemplate[]> {
    return this.productionService.listTemplates(workspaceId);
  }

  @Mutation(() => ProductTemplate)
  createProductTemplate(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateProductTemplateInput,
  ): Promise<ProductTemplate> {
    return this.productionService.createTemplate(workspaceId, input);
  }

  @Query(() => [ProductionBatch])
  productionBatches(
    @CurrentWorkspace() workspaceId: string,
  ): Promise<ProductionBatch[]> {
    return this.productionService.listBatches(workspaceId);
  }

  @Mutation(() => ProductionBatch)
  createProductionBatch(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateProductionBatchInput,
  ): Promise<ProductionBatch> {
    return this.productionService.createBatch(workspaceId, input);
  }

  @Query(() => [FinishedGoodsLot])
  finishedGoods(
    @CurrentWorkspace() workspaceId: string,
  ): Promise<FinishedGoodsLot[]> {
    return this.productionService.listFinishedGoods(workspaceId);
  }
}
