import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActaService } from './acta.service';
import { CreateActaDto } from './dto/create-acta.dto';


@Controller('acta')
export class ActaController {
  constructor(private readonly actaService: ActaService) {}

  @Post()
  create(@Body() createActaDto: CreateActaDto) {
    return this.actaService.create(createActaDto);
  }

  @Get()
  findAll() {
    return this.actaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actaService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actaService.remove(+id);
  }
}
