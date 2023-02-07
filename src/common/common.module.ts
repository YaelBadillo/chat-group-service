import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, Channel, Message, Member } from '../entities';
import { MemberBuilderService } from './entities/builders';
import { MemberDirectorService } from './entities/directors';
import {
  UsersService,
  ChannelsService,
  MessagesService,
  MembersService,
} from './services';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User, Channel, Message, Member])],
  providers: [
    UsersService,
    ChannelsService,
    MessagesService,
    MembersService,
    MemberBuilderService,
    MemberDirectorService,
  ],
  exports: [
    UsersService,
    ChannelsService,
    MessagesService,
    MembersService,
    MemberBuilderService,
    MemberDirectorService,
  ],
})
export class CommonModule {}
