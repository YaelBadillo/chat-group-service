import { Module } from '@nestjs/common';

import { MemberGateway } from './gateways';
import { MemberService } from './services';

@Module({
  providers: [MemberGateway, MemberService]
})
export class MemberModule {}
