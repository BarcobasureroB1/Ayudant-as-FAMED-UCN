import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FirmasActaService } from './firmas_acta.service';
import { CreateFirmasActaDto } from './dto/create-firmas_acta.dto';


@Controller('firmas-acta')
export class FirmasActaController {
  constructor(private readonly firmasActaService: FirmasActaService) {}

  @Post()
  create(@Body() createFirmasActaDto: CreateFirmasActaDto) {
    return this.firmasActaService.create(createFirmasActaDto);
  }

  @Get()
  findAll() {
    return this.firmasActaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.firmasActaService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.firmasActaService.remove(+id);
  }
}
