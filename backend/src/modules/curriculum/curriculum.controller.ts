import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CurriculumService } from './curriculum.service';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';


@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly curriculumService: CurriculumService) {}

  @Post()
  create(@Body() createCurriculumDto: CreateCurriculumDto) {
    return this.curriculumService.create(createCurriculumDto);
  }


  @Get(':rut_alumno')
  findByRut(@Param('rut_alumno') rut_alumno: string) {
    return this.curriculumService.findByRut(rut_alumno);
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCurriculumDto: any) {
    return this.curriculumService.update(updateCurriculumDto);
  }

}
