import { Test, TestingModule } from '@nestjs/testing';
import { MollieController } from './mollie.controller';
import { MollieService } from './mollie.service';

describe('MollieController', () => {
  let controller: MollieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MollieController],
      providers: [MollieService],
    }).compile();

    controller = module.get<MollieController>(MollieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
