import { Test, TestingModule } from '@nestjs/testing';

import { MemberGateway } from './member.gateway';
import { MemberService } from '../services';

describe('MemberGateway', () => {
  let gateway: MemberGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemberGateway, MemberService],
    }).compile();

    gateway = module.get<MemberGateway>(MemberGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
