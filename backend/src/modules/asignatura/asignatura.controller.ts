import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AsignaturaService } from './asignatura.service';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';


@Controller('asignatura')
export class AsignaturaController {
  constructor(private readonly asignaturaService: AsignaturaService) {}

  @Post()
  create(@Body() createAsignaturaDto: CreateAsignaturaDto) {
    return this.asignaturaService.create(createAsignaturaDto);
  }
  @Get()
  async findall(){
    return await this.asignaturaService.findAll()
  }
  @Get('available/:rut_alumno')
  async findAvaibleAsignaturas(@Param('rut_alumno') rut_alumno: string){
    return await this.asignaturaService.findAvaibleAsignaturas(rut_alumno)
  }
  @Get(':rut_alumno')
  findOne(@Param('rut_alumno') rut_alumno: string) {
    return this.asignaturaService.findpostulablesByRut(rut_alumno);
  }

  
}
