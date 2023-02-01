import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MemberGateway } from './gateways';
import { MemberService } from './services';
import { MemberController } from './controllers/member.controller';
import { ChannelModule } from '../channel/channel.module';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [ChannelModule, MessageModule],
  controllers: [MemberController],
  providers: [MemberGateway, MemberService, JwtService],
})
export class MemberModule {}
