import { Test, TestingModule } from '@nestjs/testing';
import { InGameService } from './in-game.service';

describe('InGameService', () => {
  let service: InGameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InGameService],
    }).compile();

    service = module.get<InGameService>(InGameService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
