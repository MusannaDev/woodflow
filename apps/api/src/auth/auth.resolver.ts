import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthUser,
  CurrentUser,
} from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { AuthPayload, LoginInput, RegisterInput } from './dto/auth.types';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  /** WithoutGuard: hali kirmaganlar uchun ochiq. */
  @Public()
  @Mutation(() => AuthPayload)
  login(@Args('input') input: LoginInput): Promise<AuthPayload> {
    return this.auth.login(input);
  }

  /** WithoutGuard: ro'yxatdan o'tmaganlar uchun ochiq. */
  @Public()
  @Mutation(() => AuthPayload)
  register(@Args('input') input: RegisterInput): Promise<AuthPayload> {
    return this.auth.register(input);
  }

  /** AuthGuard (global): token bo'lsa kifoya. */
  @Query(() => String)
  me(@CurrentUser() user: AuthUser): string {
    return user.userId;
  }

  /** Joriy sessiya holatini qayta oladi (kutish ekrani yangilash uchun). */
  @Query(() => AuthPayload)
  myAuth(@CurrentUser() user: AuthUser): Promise<AuthPayload> {
    return this.auth.buildPayload(user.userId);
  }
}
