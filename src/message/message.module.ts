import { Module } from '@nestjs/common';

import { MessageGateway } from './gateways';
import { MessageService } from './services';
@Module({
  providers: [MessageGateway, MessageService]
})
export class MessageModule {}
