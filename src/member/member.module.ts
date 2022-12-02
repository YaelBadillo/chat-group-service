import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { MemberGateway } from './gateways';
import { MemberService } from './services';

@Module({
  providers: [MemberGateway, MemberService, JwtService],
})
export class MemberModule {}
