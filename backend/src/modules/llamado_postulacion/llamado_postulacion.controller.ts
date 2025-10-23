import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { LlamadoPostulacionService } from './llamado_postulacion.service';
import { CreateLlamadoPostulacionDto } from './dto/create-llamado_postulacion.dto';
import { UpdateLlamadoPostulacionDto } from './dto/update-llamado_postulacion.dto';

@Controller('llamado-postulacion')
export class LlamadoPostulacionController {
  constructor(private readonly llamadoPostulacionService: LlamadoPostulacionService) {}

  @Post()
  create(@Body() createLlamadoPostulacionDto: CreateLlamadoPostulacionDto) {
    return this.llamadoPostulacionService.create(createLlamadoPostulacionDto);
  }

  @Get()
  findAll() {
    return this.llamadoPostulacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.llamadoPostulacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLlamadoPostulacionDto: UpdateLlamadoPostulacionDto) {
    return this.llamadoPostulacionService.update(+id, updateLlamadoPostulacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.llamadoPostulacionService.remove(+id);
  }
}
