import { Test, TestingModule } from '@nestjs/testing';
import { InGameController } from './in-game.controller';
import { InGameService } from './in-game.service';

describe('InGameController', () => {
  let controller: InGameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InGameController],
      providers: [InGameService],
    }).compile();

    controller = module.get<InGameController>(InGameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
