import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import { CreateSupplierInput, Supplier } from './dto/supplier.types';
import { SuppliersService } from './suppliers.service';

@Resolver(() => Supplier)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class SuppliersResolver {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Query(() => [Supplier])
  suppliers(@CurrentWorkspace() workspaceId: string): Promise<Supplier[]> {
    return this.suppliersService.list(workspaceId);
  }

  @Mutation(() => Supplier)
  createSupplier(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateSupplierInput,
  ): Promise<Supplier> {
    return this.suppliersService.create(workspaceId, input);
  }
}
