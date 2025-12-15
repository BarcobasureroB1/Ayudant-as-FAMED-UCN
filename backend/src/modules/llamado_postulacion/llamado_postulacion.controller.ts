import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LlamadoPostulacionService } from './llamado_postulacion.service';


import { CreateLlamadoPostulacionDto } from './dto/create-llamado-postulacion.dto';

@Controller('llamado-postulacion')
export class LlamadoPostulacionController {
  constructor(private readonly llamadoPostulacionService: LlamadoPostulacionService) {}

  @Post()
  create(@Body() createLlamadoPostulacionDto: CreateLlamadoPostulacionDto ) {
    return this.llamadoPostulacionService.create(createLlamadoPostulacionDto);
  }

  @Get()
  findAll() {
    return this.llamadoPostulacionService.findAll();
  }
  @Get(':id')
  findByAsignatura(@Param('id') id: string) {
    return this.llamadoPostulacionService.findOnebyAsignatura(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string) {
    return this.llamadoPostulacionService.cambiarEstado(+id);
  }

}
