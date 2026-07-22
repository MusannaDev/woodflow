import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { BusinessService } from './business.service';
import {
  BusinessView,
  CreateOwnerInput,
  DecidePaymentInput,
  DecideRequestInput,
  GrantAccessInput,
  JoinRequestView,
  MyBillingView,
  OwnerDetailView,
  OwnerView,
  PlatformPaymentView,
  PlatformStatsView,
  PlatformUserView,
  SubmitPaymentInput,
  UpdateBusinessInput,
  UpdateOwnerInput,
  UserDetailView,
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

  @Query(() => PlatformStatsView)
  platformStats(@CurrentUser() user: AuthUser) {
    return this.businessService.platformStats(user.userId);
  }

  @Query(() => [OwnerView])
  owners(@CurrentUser() user: AuthUser) {
    return this.businessService.owners(user.userId);
  }

  @Mutation(() => OwnerView)
  createOwner(
    @CurrentUser() user: AuthUser,
    @Args('input') input: CreateOwnerInput,
  ) {
    return this.businessService.createOwner(user.userId, input);
  }

  @Mutation(() => OwnerView)
  updateOwner(
    @CurrentUser() user: AuthUser,
    @Args('input') input: UpdateOwnerInput,
  ) {
    return this.businessService.updateOwner(user.userId, input);
  }

  @Mutation(() => Boolean)
  deleteOwner(
    @CurrentUser() user: AuthUser,
    @Args('businessId') businessId: string,
  ) {
    return this.businessService.deleteOwner(user.userId, businessId);
  }

  @Query(() => [PlatformUserView])
  allUsers(@CurrentUser() user: AuthUser) {
    return this.businessService.allUsers(user.userId);
  }

  @Query(() => OwnerDetailView)
  ownerDetail(
    @CurrentUser() user: AuthUser,
    @Args('businessId') businessId: string,
  ) {
    return this.businessService.ownerDetail(user.userId, businessId);
  }

  @Query(() => UserDetailView)
  userDetail(
    @CurrentUser() user: AuthUser,
    @Args('userId') userId: string,
  ) {
    return this.businessService.userDetail(user.userId, userId);
  }

  // ── Platforma to'lovi (obuna) ──

  @Query(() => MyBillingView)
  myBilling(@CurrentUser() user: AuthUser) {
    return this.businessService.myBilling(user.userId);
  }

  @Mutation(() => PlatformPaymentView)
  submitPlatformPayment(
    @CurrentUser() user: AuthUser,
    @Args('input') input: SubmitPaymentInput,
  ) {
    return this.businessService.submitPlatformPayment(user.userId, input);
  }

  @Query(() => [PlatformPaymentView])
  pendingPlatformPayments(@CurrentUser() user: AuthUser) {
    return this.businessService.pendingPlatformPayments(user.userId);
  }

  @Mutation(() => PlatformPaymentView)
  decidePlatformPayment(
    @CurrentUser() user: AuthUser,
    @Args('input') input: DecidePaymentInput,
  ) {
    return this.businessService.decidePlatformPayment(user.userId, input);
  }

  @Mutation(() => OwnerView)
  grantFreeAccess(
    @CurrentUser() user: AuthUser,
    @Args('input') input: GrantAccessInput,
  ) {
    return this.businessService.grantFreeAccess(user.userId, input);
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
