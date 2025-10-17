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
    return this.coordinadorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coordinadorService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coordinadorService.remove(+id);
  }
}
