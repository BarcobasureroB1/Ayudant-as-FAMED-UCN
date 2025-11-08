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

  @Get(':rut')
  findByAlumno(@Param('rut') rut: string) {
    return this.actividadesCientificasService.findByAlumno(rut);
  }
  
  
}
