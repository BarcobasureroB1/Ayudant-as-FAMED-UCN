import { Module } from '@nestjs/common';
import { AsignaturaAlumnoService } from './asignatura_alumno.service';
import { AsignaturaAlumnoController } from './asignatura_alumno.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignaturaAlumno } from './entities/asignatura_alumno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsignaturaAlumno])],
  controllers: [AsignaturaAlumnoController],
  providers: [AsignaturaAlumnoService],
})
export class AsignaturaAlumnoModule {}
