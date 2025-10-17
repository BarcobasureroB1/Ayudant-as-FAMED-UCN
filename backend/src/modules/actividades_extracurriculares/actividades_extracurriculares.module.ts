import { Module } from '@nestjs/common';
import { ActividadesExtracurricularesService } from './actividades_extracurriculares.service';
import { ActividadesExtracurricularesController } from './actividades_extracurriculares.controller';

@Module({
  controllers: [ActividadesExtracurricularesController],
  providers: [ActividadesExtracurricularesService],
})
export class ActividadesExtracurricularesModule {}
