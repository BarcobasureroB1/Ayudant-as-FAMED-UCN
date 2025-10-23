import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsignaturaAlumnoService } from './asignatura_alumno.service';
import { CreateAsignaturaAlumnoDto } from './dto/create-asignatura_alumno.dto';
import { UpdateAsignaturaAlumnoDto } from './dto/update-asignatura_alumno.dto';

@Controller('asignatura-alumno')
export class AsignaturaAlumnoController {
  constructor(private readonly asignaturaAlumnoService: AsignaturaAlumnoService) {}

  @Post()
  create(@Body() createAsignaturaAlumnoDto: CreateAsignaturaAlumnoDto) {
    return this.asignaturaAlumnoService.create(createAsignaturaAlumnoDto);
  }

  @Get(':rut_alumno')
  findPostulablesByRut(@Param('rut_alumno') rut_alumno: string) {
    return this.asignaturaAlumnoService.findPostulablesByRut(rut_alumno);
  }
}
