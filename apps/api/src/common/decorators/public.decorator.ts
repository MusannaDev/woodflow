import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * "WithoutGuard" — ochiq endpoint belgisi.
 * Login/Signup kabi hali ro'yxatdan o'tmagan/kirmaganlar uchun.
 * Global AuthGuard bu belgini ko'rsa, tokensiz ham o'tkazadi.
 *
 *   @Public()
 *   @Mutation(() => AuthPayload)
 *   login(...) {}
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
