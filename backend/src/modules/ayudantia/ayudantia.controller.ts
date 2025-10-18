import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AyudantiaService } from './ayudantia.service';
import { CreateAyudantiaDto } from './dto/create-ayudantia.dto';


@Controller('ayudantia')
export class AyudantiaController {
  constructor(private readonly ayudantiaService: AyudantiaService) {}

  @Post()
  create(@Body() createAyudantiaDto: CreateAyudantiaDto) {
    return this.ayudantiaService.create(createAyudantiaDto);
  }

  @Get()
  findAll() {
    return this.ayudantiaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ayudantiaService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ayudantiaService.remove(+id);
  }
}
