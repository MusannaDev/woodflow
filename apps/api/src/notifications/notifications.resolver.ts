import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { NotificationView } from './dto/notification.types';
import { NotificationsService } from './notifications.service';

@Resolver()
export class NotificationsResolver {
  constructor(private readonly service: NotificationsService) {}

  @Query(() => [NotificationView])
  myNotifications(@CurrentUser() user: AuthUser) {
    return this.service.list(user.userId);
  }

  @Query(() => Int)
  unreadCount(@CurrentUser() user: AuthUser) {
    return this.service.unreadCount(user.userId);
  }

  @Mutation(() => Boolean)
  markNotificationRead(
    @CurrentUser() user: AuthUser,
    @Args('id') id: string,
  ) {
    return this.service.markRead(user.userId, id);
  }

  @Mutation(() => Boolean)
  markAllNotificationsRead(@CurrentUser() user: AuthUser) {
    return this.service.markAllRead(user.userId);
  }
}
