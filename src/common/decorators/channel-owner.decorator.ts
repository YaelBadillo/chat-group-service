import { applyDecorators, UseGuards } from '@nestjs/common';

import { ChannelOwnerGuard } from '../guard';

export const ChannelOwner = () => applyDecorators(UseGuards(ChannelOwnerGuard));
