import { applyDecorators, UseGuards } from '@nestjs/common';

import { ChannelOwnerGuard } from '../guard';

export const ChannelOwner = (...args: string[]) => 
  applyDecorators(
    UseGuards(ChannelOwnerGuard),
  );
