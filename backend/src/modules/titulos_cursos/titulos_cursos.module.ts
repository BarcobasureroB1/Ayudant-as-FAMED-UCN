import { Module } from '@nestjs/common';
import { TitulosCursosService } from './titulos_cursos.service';
import { TitulosCursosController } from './titulos_cursos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TitulosCurso } from './entities/titulos_curso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TitulosCurso])],
  controllers: [TitulosCursosController],
  providers: [TitulosCursosService],
})
export class TitulosCursosModule {}
