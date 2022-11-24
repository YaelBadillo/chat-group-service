import { Module } from '@nestjs/common';

import { ChannelController } from './controllers';
import { ChannelService } from './services';
import { PasswordModule } from '../shared';

@Module({
  imports: [PasswordModule],
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
