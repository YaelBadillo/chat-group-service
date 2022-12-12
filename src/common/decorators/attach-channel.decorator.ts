import { applyDecorators, UseInterceptors } from '@nestjs/common';

import { AttachChannelInterceptor } from '../interceptors';

export const AttachChannel = () =>
  applyDecorators(UseInterceptors(AttachChannelInterceptor));
