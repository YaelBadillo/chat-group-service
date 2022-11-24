import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, Channel, Message } from '../entities';
import { UsersService, ChannelsService, MessagesService } from './services';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Channel, Message])],
  providers: [UsersService, ChannelsService, MessagesService],
  exports: [UsersService, ChannelsService, MessagesService],
})
export class CommonModule {}
