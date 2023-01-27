import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MessageService } from './services';
import { MessageGateway } from './gateways';

@Module({
  providers: [MessageGateway, MessageService, JwtService],
  exports: [MessageGateway],
})
export class MessageModule {}
