import { Module } from '@nestjs/common';
import { ActividadesCientificasService } from './actividades_cientificas.service';
import { ActividadesCientificasController } from './actividades_cientificas.controller';

@Module({
  controllers: [ActividadesCientificasController],
  providers: [ActividadesCientificasService],
})
export class ActividadesCientificasModule {}
