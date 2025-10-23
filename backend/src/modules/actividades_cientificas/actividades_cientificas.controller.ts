import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActividadesCientificasService } from './actividades_cientificas.service';
import { CreateActividadesCientificaDto } from './dto/create-actividades_cientifica.dto';


@Controller('cientificas')
export class ActividadesCientificasController {
  constructor(private readonly actividadesCientificasService: ActividadesCientificasService) {}



  @Get()
  findAll() {
    return this.actividadesCientificasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesCientificasService.findOne(+id);
  }

  @Get(':rut')
  findByUsuario(@Param('rut') rut: string) {
    return this.actividadesCientificasService.findByUsuario(rut);
  }
  
  
}
