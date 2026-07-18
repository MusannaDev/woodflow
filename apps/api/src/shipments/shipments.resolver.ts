import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import { CreateShipmentInput, Shipment } from './dto/shipment.types';
import { ShipmentsService } from './shipments.service';

@Resolver(() => Shipment)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class ShipmentsResolver {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Query(() => [Shipment])
  shipments(@CurrentWorkspace() workspaceId: string): Promise<Shipment[]> {
    return this.shipmentsService.list(workspaceId);
  }

  @Query(() => Shipment)
  shipment(
    @CurrentWorkspace() workspaceId: string,
    @Args('id') id: string,
  ): Promise<Shipment> {
    return this.shipmentsService.findOne(workspaceId, id);
  }

  @Mutation(() => Shipment)
  createShipment(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateShipmentInput,
  ): Promise<Shipment> {
    return this.shipmentsService.create(workspaceId, input);
  }
}
