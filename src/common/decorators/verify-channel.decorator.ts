import { applyDecorators, UseGuards } from '@nestjs/common';

import { VerifyChannelGuard } from '../guard';

export const VerifyChannel = () =>
  applyDecorators(UseGuards(VerifyChannelGuard));
