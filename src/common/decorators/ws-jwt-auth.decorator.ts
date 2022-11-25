import { applyDecorators, UseGuards } from '@nestjs/common';

import { WsJwtAuthGuard } from '../guard';

export const WsJwtAuth = () => applyDecorators(UseGuards(WsJwtAuthGuard));
