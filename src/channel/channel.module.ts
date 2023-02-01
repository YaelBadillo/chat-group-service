import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ChannelController } from './controllers';
import { ChannelService } from './services';
import { PasswordModule } from '../shared';
import { ChannelGateway } from './gateways';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [PasswordModule, MessageModule],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelGateway, JwtService],
  exports: [ChannelGateway],
})
export class ChannelModule {}
