import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AyudantiasCurriculumService } from './ayudantias_curriculum.service';
import { CreateAyudantiasCurriculumDto } from './dto/create-ayudantias_curriculum.dto';


@Controller('ayudantias-curriculum')
export class AyudantiasCurriculumController {
  constructor(private readonly ayudantiasCurriculumService: AyudantiasCurriculumService) {}

  @Post()
  create(@Body() createAyudantiasCurriculumDto: CreateAyudantiasCurriculumDto) {
    return this.ayudantiasCurriculumService.create(createAyudantiasCurriculumDto);
  }

  @Get()
  findAll() {
    return this.ayudantiasCurriculumService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ayudantiasCurriculumService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ayudantiasCurriculumService.remove(+id);
  }
}
