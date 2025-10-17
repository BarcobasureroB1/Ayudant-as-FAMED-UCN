import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TitulosCursosService } from './titulos_cursos.service';
import { CreateTitulosCursoDto } from './dto/create-titulos_curso.dto';


@Controller('titulos-cursos')
export class TitulosCursosController {
  constructor(private readonly titulosCursosService: TitulosCursosService) {}

  @Post()
  create(@Body() createTitulosCursoDto: CreateTitulosCursoDto) {
    return this.titulosCursosService.create(createTitulosCursoDto);
  }

  @Get()
  findAll() {
    return this.titulosCursosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.titulosCursosService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.titulosCursosService.remove(+id);
  }
}
