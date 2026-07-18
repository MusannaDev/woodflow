import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * "RoleGuard" belgisi — faqat sanab o'tilgan rollar kiradi.
 * Joriy workspace'dagi Membership.role tekshiriladi.
 *
 *   @Roles(Role.ADMIN, Role.AGENT)
 *   @Mutation(...)
 *   sensitiveAction(...) {}
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
