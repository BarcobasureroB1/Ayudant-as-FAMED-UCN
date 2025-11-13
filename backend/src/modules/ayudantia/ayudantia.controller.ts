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
  @Get(':rut')
  findByUsuario(@Param('rut') rut: string) {
    return this.ayudantiaService.findByUsuario(rut);
  }
}
