import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AyudantiasCurriculumService } from './ayudantias_curriculum.service';
import { CreateAyudantiasCurriculumDto } from './dto/create-ayudantias_curriculum.dto';


@Controller('ayudantias-curriculum')
export class AyudantiasCurriculumController {
  constructor(private readonly ayudantiasCurriculumService: AyudantiasCurriculumService) {}
  @Get(':rut')
  findByUsuario(@Param('rut') rut: string) {
    return this.ayudantiasCurriculumService.findByUsuario(rut);
  }
 
}
