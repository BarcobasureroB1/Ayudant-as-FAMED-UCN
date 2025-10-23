import { Test, TestingModule } from '@nestjs/testing';
import { RequisitoExtraController } from './requisito_extra.controller';
import { RequisitoExtraService } from './requisito_extra.service';

describe('RequisitoExtraController', () => {
  let controller: RequisitoExtraController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RequisitoExtraController],
      providers: [RequisitoExtraService],
    }).compile();

    controller = module.get<RequisitoExtraController>(RequisitoExtraController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
