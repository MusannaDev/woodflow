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

  /** Owner: shu makondagi oylik tarixi (tasdiq holati bilan). */
  @Query(() => [SalaryPayment])
  salaryHistory(
    @CurrentWorkspace() workspaceId: string,
  ): Promise<SalaryPayment[]> {
    return this.employeesService.salaryHistory(workspaceId);
  }

  /** Ishchi: o'z oyliklari. */
  @Query(() => [SalaryPayment])
  mySalaries(@CurrentUser() user: AuthUser): Promise<SalaryPayment[]> {
    return this.employeesService.mySalaries(user.userId);
  }

  /** Ishchi: oylikni qabul qildim deb tasdiqlaydi. */
  @Mutation(() => SalaryPayment)
  confirmSalary(
    @CurrentUser() user: AuthUser,
    @Args('paymentId') paymentId: string,
  ): Promise<SalaryPayment> {
    return this.employeesService.confirmSalary(user.userId, paymentId);
  }
}
