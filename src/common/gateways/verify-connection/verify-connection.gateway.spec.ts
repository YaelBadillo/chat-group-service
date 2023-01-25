import { Test, TestingModule } from '@nestjs/testing';
import { VerifyConnectionGateway } from './verify-connection.gateway';

describe('VerifyConnectionGateway', () => {
  let gateway: VerifyConnectionGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerifyConnectionGateway],
    }).compile();

    gateway = module.get<VerifyConnectionGateway>(VerifyConnectionGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
