import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/** WorkspaceGuard o'rnatgan joriy workspaceId ni resolver'ga beradi. */
export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, context: ExecutionContext): string => {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req.workspaceId;
  },
);
