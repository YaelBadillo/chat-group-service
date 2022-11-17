import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { User } from '../../entities';
import { RequestWithUser } from '../interfaces';

export const UserFromRequest = createParamDecorator(
  (propertyName: string, context: ExecutionContext): User | string | Date => {
    const { user }: RequestWithUser = context.switchToHttp().getRequest();
    if (!user)
      throw new InternalServerErrorException('User not found (request)');

    return propertyName ? user?.[propertyName] : user;
  },
);