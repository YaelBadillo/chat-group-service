import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';

import { Channel } from '../../entities';
import { SpaceType } from '../enums';
import { RequestWithChannel } from '../interfaces';

export const ChannelFromRequest = createParamDecorator(
  (
    propertyName: string,
    context: ExecutionContext,
  ): Channel | string | Date | SpaceType => {
    const { channel }: RequestWithChannel = context.switchToHttp().getRequest();
    if (!channel)
      throw new InternalServerErrorException('Channel not found (request)');

    return propertyName ? channel?.[propertyName] : channel;
  },
);
