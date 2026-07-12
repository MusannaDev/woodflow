import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ExpenseCategory } from '@prisma/client';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import { CreateExpenseInput, Expense } from './dto/expense.types';
import { ExpensesService } from './expenses.service';

@Resolver(() => Expense)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class ExpensesResolver {
  constructor(private readonly expensesService: ExpensesService) {}

  @Query(() => [Expense])
  expenses(
    @CurrentWorkspace() workspaceId: string,
    @Args('category', { type: () => ExpenseCategory, nullable: true })
    category?: ExpenseCategory,
  ): Promise<Expense[]> {
    return this.expensesService.list(workspaceId, { category });
  }

  @Mutation(() => Expense)
  createExpense(
    @CurrentWorkspace() workspaceId: string,
    @Args('input') input: CreateExpenseInput,
  ): Promise<Expense> {
    return this.expensesService.create(workspaceId, input);
  }
}
