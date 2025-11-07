import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AlumnoService } from './alumno.service';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';

@Controller('alumno')
export class AlumnoController {
  constructor(private readonly alumnoService: AlumnoService) {}

  @Post()
  create(@Body() createAlumnoDto: CreateAlumnoDto) {
    return this.alumnoService.create(createAlumnoDto);
  }

 
}
