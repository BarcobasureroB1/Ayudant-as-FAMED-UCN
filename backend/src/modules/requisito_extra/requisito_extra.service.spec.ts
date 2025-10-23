import { Test, TestingModule } from '@nestjs/testing';
import { RequisitoExtraService } from './requisito_extra.service';

describe('RequisitoExtraService', () => {
  let service: RequisitoExtraService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequisitoExtraService],
    }).compile();

    service = module.get<RequisitoExtraService>(RequisitoExtraService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
