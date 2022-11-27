import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { ChannelController } from './controllers';
import { ChannelService } from './services';
import { PasswordModule } from '../shared';
import { ChannelGateway } from './gateways';

@Module({
  imports: [PasswordModule],
  controllers: [ChannelController],
  providers: [ChannelService, ChannelGateway, JwtService],
})
export class ChannelModule {}
