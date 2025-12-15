import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AyudantiaService } from './ayudantia.service';
import { CreateAyudantiaDto } from './dto/create-ayudantia.dto';
import { evaluarAyudantiaDto } from './dto/evaluar.dto';


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
  @Get(':rut')
  findByUsuario(@Param('rut') rut: string) {
    return this.ayudantiaService.findByUsuario(rut);
  }
  @Get('coordinador/:rut_coordinador')
  findByCoordinador(@Param('rut_coordinador') rut_coordinador: string) {
    return this.ayudantiaService.findAyudantiasByCoordinadorRut(rut_coordinador);
  }
  @Patch(':id')
  evaluar(@Param('id') id: string, @Body() dto: evaluarAyudantiaDto) {
    return this.ayudantiaService.evaluarAyudantia(+id, dto);
  }
  @Get('coord')
  findAllByCoordinador() {
    return this.ayudantiaService.findAyudantiasByCoordinadores();
  }
}
