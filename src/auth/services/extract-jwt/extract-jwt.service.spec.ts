import { Test, TestingModule } from '@nestjs/testing';
import { ExtractJwtService } from './extract-jwt.service';

describe('ExtractJwtService', () => {
  let service: ExtractJwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExtractJwtService],
    }).compile();

    service = module.get<ExtractJwtService>(ExtractJwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
