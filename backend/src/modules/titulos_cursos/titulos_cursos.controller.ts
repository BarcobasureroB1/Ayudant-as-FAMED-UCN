import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TitulosCursosService } from './titulos_cursos.service';
import { CreateTitulosCursoDto } from './dto/create-titulos_curso.dto';


@Controller('titulos-cursos')
export class TitulosCursosController {
  constructor(private readonly titulosCursosService: TitulosCursosService) {}

  @Get(':rut')
  findByAlumno(@Param('rut') rut: string) {
    return this.titulosCursosService.findByAlumno(rut);
  }
}
