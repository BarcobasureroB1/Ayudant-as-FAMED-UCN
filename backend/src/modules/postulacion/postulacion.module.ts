import { Module } from '@nestjs/common';
import { PostulacionService } from './postulacion.service';
import { PostulacionController } from './postulacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postulacion } from './entities/postulacion.entity';
import { Ayudantia } from '../ayudantia/entities/ayudantia.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { AsignaturaAlumno } from '../asignatura_alumno/entities/asignatura_alumno.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Postulacion, Asignatura, Usuario, Coordinador, Ayudantia, Alumno, AsignaturaAlumno])],
  controllers: [PostulacionController],
  providers: [PostulacionService],
})
export class PostulacionModule {}
