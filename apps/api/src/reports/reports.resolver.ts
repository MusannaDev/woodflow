import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { CurrentWorkspace } from '../common/decorators/current-workspace.decorator';
import { GqlAuthGuard } from '../common/guards/gql-auth.guard';
import { WorkspaceGuard } from '../common/guards/workspace.guard';
import { TenantInterceptor } from '../common/tenant/tenant.interceptor';
import { ConsolidatedReport } from './dto/consolidation.types';
import { ShipmentPnl } from './dto/report.types';
import { ReportsService } from './reports.service';

@Resolver(() => ShipmentPnl)
@UseGuards(GqlAuthGuard, WorkspaceGuard)
@UseInterceptors(TenantInterceptor)
export class ReportsResolver {
  constructor(private readonly reportsService: ReportsService) {}

  @Query(() => ShipmentPnl)
  shipmentPnl(
    @CurrentWorkspace() workspaceId: string,
    @Args('shipmentId') shipmentId: string,
  ): Promise<ShipmentPnl> {
    return this.reportsService.shipmentPnl(workspaceId, shipmentId);
  }

  /** Faqat OWNER: ikkala biznes jami (service ichida tekshiriladi). */
  @Query(() => ConsolidatedReport)
  consolidatedReport(): Promise<ConsolidatedReport> {
    return this.reportsService.consolidatedReport();
  }
}
