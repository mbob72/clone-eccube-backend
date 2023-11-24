import { Test, TestingModule } from '@nestjs/testing';
import { MollieService } from './mollie.service';

describe('MollieService', () => {
  let service: MollieService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MollieService],
    }).compile();

    service = module.get<MollieService>(MollieService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
