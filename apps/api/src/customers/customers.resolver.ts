import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import { CreateCustomerInput, Customer } from './dto/customer.types';
import { CustomersService } from './customers.service';

@Resolver(() => Customer)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class CustomersResolver {
  constructor(private readonly customersService: CustomersService) {}

  @Query(() => [Customer])
  customers(@CurrentWorkspace() workspaceId: string): Promise<Customer[]> {
    return this.customersService.list(workspaceId);
  }

  @Mutation(() => Customer)
  createCustomer(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateCustomerInput,
  ): Promise<Customer> {
    return this.customersService.create(workspaceId, input);
  }
}
