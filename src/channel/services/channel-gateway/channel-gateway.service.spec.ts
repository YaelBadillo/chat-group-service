import { Test, TestingModule } from '@nestjs/testing';
import { ChannelGatewayService } from './channel-gateway.service';

describe('ChannelGatewayService', () => {
  let service: ChannelGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChannelGatewayService],
    }).compile();

    service = module.get<ChannelGatewayService>(ChannelGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
