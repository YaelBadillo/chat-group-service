import { applyDecorators, UseGuards } from '@nestjs/common';

import { VerifyChannelGuard, ChannelOwnerGuard } from '../guard';

export const ChannelOwner = () =>
  applyDecorators(UseGuards(VerifyChannelGuard, ChannelOwnerGuard));
