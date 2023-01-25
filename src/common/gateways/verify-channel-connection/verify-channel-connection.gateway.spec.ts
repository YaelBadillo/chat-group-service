import { Test, TestingModule } from '@nestjs/testing';
import { VerifyChannelConnectionGateway } from './verify-channel-connection.gateway';

describe('VerifyChannelConnectionGateway', () => {
  let gateway: VerifyChannelConnectionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerifyChannelConnectionGateway],
    }).compile();

    gateway = module.get<VerifyChannelConnectionGateway>(VerifyChannelConnectionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
