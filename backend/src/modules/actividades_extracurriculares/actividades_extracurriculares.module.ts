import { Module } from '@nestjs/common';
import { ActividadesExtracurricularesService } from './actividades_extracurriculares.service';
import { ActividadesExtracurricularesController } from './actividades_extracurriculares.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadesExtracurriculare } from './entities/actividades_extracurriculare.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActividadesExtracurriculare])],
  controllers: [ActividadesExtracurricularesController],
  providers: [ActividadesExtracurricularesService],
})
export class ActividadesExtracurricularesModule {}
