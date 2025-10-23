import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ActividadesExtracurricularesService } from './actividades_extracurriculares.service';
import { CreateActividadesExtracurriculareDto } from './dto/create-actividades_extracurriculare.dto';


@Controller('extracurriculares')
export class ActividadesExtracurricularesController {
  constructor(private readonly actividadesExtracurricularesService: ActividadesExtracurricularesService) {}

  @Get(':rut')
  findByUsuario(@Param('rut') rut: string) {
    return this.actividadesExtracurricularesService.findByUsuario(rut);
  }

}
