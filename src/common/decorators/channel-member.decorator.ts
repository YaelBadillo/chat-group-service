import { applyDecorators, UseGuards } from '@nestjs/common';

import { ChannelMemberGuard } from '../guard';

export const ChannelMember = () =>
  applyDecorators(UseGuards(ChannelMemberGuard));
