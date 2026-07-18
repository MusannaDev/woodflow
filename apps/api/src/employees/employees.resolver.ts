import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import {
  CreateEmployeeInput,
  Employee,
  PaySalaryInput,
  SalaryPayment,
} from './dto/employee.types';
import { EmployeesService } from './employees.service';

@Resolver(() => Employee)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class EmployeesResolver {
  constructor(private readonly employeesService: EmployeesService) {}

  @Query(() => [Employee])
  employees(@CurrentWorkspace() workspaceId: string): Promise<Employee[]> {
    return this.employeesService.list(workspaceId);
  }

  @Mutation(() => Employee)
  createEmployee(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateEmployeeInput,
  ): Promise<Employee> {
    return this.employeesService.create(workspaceId, input);
  }

  @Mutation(() => SalaryPayment)
  paySalary(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: PaySalaryInput,
  ): Promise<SalaryPayment> {
    return this.employeesService.paySalary(workspaceId, input);
  }
}
