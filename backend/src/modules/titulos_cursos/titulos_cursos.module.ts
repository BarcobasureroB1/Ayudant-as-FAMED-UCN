import { Module } from '@nestjs/common';
import { TitulosCursosService } from './titulos_cursos.service';
import { TitulosCursosController } from './titulos_cursos.controller';

@Module({
  controllers: [TitulosCursosController],
  providers: [TitulosCursosService],
})
export class TitulosCursosModule {}
