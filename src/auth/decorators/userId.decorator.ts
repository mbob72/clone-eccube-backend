import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserId = createParamDecorator(
  (_: unknown, context: ExecutionContext): string => {
    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new Error(`No userId from request.`);
    }
    return user.userId;
  },
);
