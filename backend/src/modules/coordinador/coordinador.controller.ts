import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CoordinadorService } from './coordinador.service';
import { CreateCoordinadorDto } from './dto/create-coordinador.dto';

@Controller('coordinador')
export class CoordinadorController {
  constructor(private readonly coordinadorService: CoordinadorService) {}

  @Post()
  create(@Body() createCoordinadorDto: CreateCoordinadorDto) {
    return this.coordinadorService.create(createCoordinadorDto);
  }

  @Get()
  findAll() {
    return this.coordinadorService.getAll();
  }

  @Patch('estado/:id_asignatura/:rut_coordinador')
  actualizarEstadoCoordinador(
    @Param('id_asignatura') id_asignatura: number,
    @Param('rut_coordinador') rut_coordinador: number,
  ) {
    return this.coordinadorService.actualizarEstadoCoordinador(
      id_asignatura,
      rut_coordinador,
    );
  }
  
}
