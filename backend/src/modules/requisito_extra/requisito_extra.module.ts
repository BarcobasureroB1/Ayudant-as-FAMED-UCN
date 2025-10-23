import { Module } from '@nestjs/common';
import { RequisitoExtraService } from './requisito_extra.service';
import { RequisitoExtraController } from './requisito_extra.controller';

@Module({
  controllers: [RequisitoExtraController],
  providers: [RequisitoExtraService],
})
export class RequisitoExtraModule {}
