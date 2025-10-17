import { Module } from '@nestjs/common';
import { CoordinadorService } from './coordinador.service';
import { CoordinadorController } from './coordinador.controller';

@Module({
  controllers: [CoordinadorController],
  providers: [CoordinadorService],
})
export class CoordinadorModule {}
