import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActividadesExtracurricularesService } from './actividades_extracurriculares.service';
import { CreateActividadesExtracurriculareDto } from './dto/create-actividades_extracurriculare.dto';


@Controller('actividades-extracurriculares')
export class ActividadesExtracurricularesController {
  constructor(private readonly actividadesExtracurricularesService: ActividadesExtracurricularesService) {}

  @Post()
  create(@Body() createActividadesExtracurriculareDto: CreateActividadesExtracurriculareDto) {
    return this.actividadesExtracurricularesService.create(createActividadesExtracurriculareDto);
  }

  @Get()
  findAll() {
    return this.actividadesExtracurricularesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesExtracurricularesService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesExtracurricularesService.remove(+id);
  }
}
