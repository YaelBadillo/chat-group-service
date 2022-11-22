import { Module } from '@nestjs/common';

import { ChannelController } from './controllers';
import { ChannelService } from './services';

@Module({
  controllers: [ChannelController],
  providers: [ChannelService],
})
export class ChannelModule {}
