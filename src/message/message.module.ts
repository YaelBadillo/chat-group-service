import { Module } from '@nestjs/common';

import { MessageService } from './services';
import { MessageGateway } from './gateways';

@Module({
  providers: [MessageGateway, MessageService],
})
export class MessageModule {}
