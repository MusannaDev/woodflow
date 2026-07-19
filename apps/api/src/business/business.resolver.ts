import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { BusinessService } from './business.service';
import {
  BusinessView,
  DecideRequestInput,
  JoinRequestView,
  UpdateBusinessInput,
} from './dto/business.types';

/**
 * Global AuthGuard token talab qiladi; CEO/OWNER tekshiruvlari service ichida
 * (platformRole va biznes egaligi DB'dan o'qiladi).
 */
@Resolver()
export class BusinessResolver {
  constructor(private readonly businessService: BusinessService) {}

  // ── CEO ──
  @Query(() => [JoinRequestView])
  pendingOwnerRequests(@CurrentUser() user: AuthUser) {
    return this.businessService.pendingOwnerRequests(user.userId);
  }

  @Mutation(() => JoinRequestView)
  decideOwnerRequest(
    @CurrentUser() user: AuthUser,
    @Args('input') input: DecideRequestInput,
  ) {
    return this.businessService.decideOwnerRequest(user.userId, input);
  }

  // ── OWNER ──
  @Query(() => [JoinRequestView])
  pendingWorkerRequests(@CurrentUser() user: AuthUser) {
    return this.businessService.pendingWorkerRequests(user.userId);
  }

  @Mutation(() => JoinRequestView)
  decideWorkerRequest(
    @CurrentUser() user: AuthUser,
    @Args('input') input: DecideRequestInput,
  ) {
    return this.businessService.decideWorkerRequest(user.userId, input);
  }

  @Query(() => BusinessView)
  myBusiness(@CurrentUser() user: AuthUser) {
    return this.businessService.myBusiness(user.userId);
  }

  @Mutation(() => BusinessView)
  updateBusiness(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateBusinessInput,
  ) {
    return this.businessService.updateBusiness(user.userId, input);
  }
}
