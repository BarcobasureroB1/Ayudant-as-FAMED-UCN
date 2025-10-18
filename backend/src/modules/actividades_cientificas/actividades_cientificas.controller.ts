import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActividadesCientificasService } from './actividades_cientificas.service';
import { CreateActividadesCientificaDto } from './dto/create-actividades_cientifica.dto';


@Controller('actividades-cientificas')
export class ActividadesCientificasController {
  constructor(private readonly actividadesCientificasService: ActividadesCientificasService) {}

  @Post()
  create(@Body() createActividadesCientificaDto: CreateActividadesCientificaDto) {
    return this.actividadesCientificasService.create(createActividadesCientificaDto);
  }

  @Get()
  findAll() {
    return this.actividadesCientificasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesCientificasService.findOne(+id);
  }

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesCientificasService.remove(+id);
  }
}
