import { Module } from '@nestjs/common';
import { AsignaturaService } from './asignatura.service';
import { AsignaturaController } from './asignatura.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Asignatura } from './entities/asignatura.entity';
import { DepartamentoModule } from '../departamento/departamento.module';
import { Departamento } from '../departamento/entities/departamento.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { UsuarioModule } from '../usuario/usuario.module';
import { Postulacion } from '../postulacion/entities/postulacion.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { AlumnoModule } from '../alumno/alumno.module';
import { AsignaturaAlumno } from '../asignatura_alumno/entities/asignatura_alumno.entity';
import { AsignaturaAlumnoModule } from '../asignatura_alumno/asignatura_alumno.module';

@Module({
  imports: [TypeOrmModule.forFeature([Asignatura,Departamento,Usuario,Postulacion,Alumno,AsignaturaAlumno]),
DepartamentoModule,UsuarioModule,AlumnoModule,AsignaturaAlumnoModule],
  controllers: [AsignaturaController],
  providers: [AsignaturaService],
})
export class AsignaturaModule {}
