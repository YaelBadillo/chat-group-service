import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MemberGateway } from './gateways';
import { MemberService } from './services';
import { MemberController } from './controllers/member.controller';

@Module({
  providers: [MemberGateway, MemberService, JwtService],
  controllers: [MemberController],
})
export class MemberModule {}
