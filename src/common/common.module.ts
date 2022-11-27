import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, Channel, Message, Member } from '../entities';
import {
  UsersService,
  ChannelsService,
  MessagesService,
  MembersService,
} from './services';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Channel, Message, Member])],
  providers: [UsersService, ChannelsService, MessagesService, MembersService],
  exports: [UsersService, ChannelsService, MessagesService, MembersService],
})
export class CommonModule {}
