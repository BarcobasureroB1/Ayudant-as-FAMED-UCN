import { Module } from '@nestjs/common';
import { ActaService } from './acta.service';
import { ActaController } from './acta.controller';

@Module({
  controllers: [ActaController],
  providers: [ActaService],
})
export class ActaModule {}
