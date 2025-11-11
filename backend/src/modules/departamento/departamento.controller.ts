import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepartamentoService } from './departamento.service';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';


@Controller('departamento')
export class DepartamentoController {
  constructor(private readonly departamentoService: DepartamentoService) {}

  @Post()
  create(@Body() createDepartamentoDto: CreateDepartamentoDto) {
    return this.departamentoService.create(createDepartamentoDto);
  }

  @Get()
  findAll() {
    return this.departamentoService.findAll();
  }

  

  @Patch('asignar-secretario/:id/:rut_secretario')
  asignarSecretario(@Param('id') id: string, @Param('rut_secretario') rut_secretario: string) {
    return this.departamentoService.asignarsecretariario(+id, rut_secretario);
  }
  
  @Get(':rut_secretaria')
  findBySecretarioRut(@Param('rut_secretaria') rut_secretaria: string) {
    return this.departamentoService.findBysecretarioRut(rut_secretaria);
  }
}
