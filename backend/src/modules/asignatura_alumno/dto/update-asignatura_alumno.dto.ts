import { PartialType } from '@nestjs/mapped-types';
import { CreateAsignaturaAlumnoDto } from './create-asignatura_alumno.dto';

export class UpdateAsignaturaAlumnoDto extends PartialType(CreateAsignaturaAlumnoDto) {}
