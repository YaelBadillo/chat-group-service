import { applyDecorators, UseGuards } from '@nestjs/common';

import { ChannelMemberGuard, ChannelOwnerGuard } from '../guard';

export const ChannelOwner = () =>
  applyDecorators(UseGuards(ChannelMemberGuard, ChannelOwnerGuard));
