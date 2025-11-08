import { Module } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CurriculumController } from './curriculum.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curriculum } from './entities/curriculum.entity';
import { AyudantiasCurriculum } from '../ayudantias_curriculum/entities/ayudantias_curriculum.entity';
import { TitulosCurso } from '../titulos_cursos/entities/titulos_curso.entity';
import { ActividadesCientifica } from '../actividades_cientificas/entities/actividades_cientifica.entity';

import { ActividadesExtracurriculare } from '../actividades_extracurriculares/entities/actividades_extracurriculare.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { Alumno } from '../alumno/entities/alumno.entity';
import { AlumnoModule } from '../alumno/alumno.module';


@Module({
  imports: [TypeOrmModule.forFeature([Curriculum,Alumno,AyudantiasCurriculum,TitulosCurso,ActividadesCientifica,ActividadesExtracurriculare]),
UsuarioModule,AlumnoModule],
  controllers: [CurriculumController],
  providers: [CurriculumService],
})
export class CurriculumModule {}
