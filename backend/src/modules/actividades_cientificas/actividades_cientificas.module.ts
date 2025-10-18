import { Module } from '@nestjs/common';
import { ActividadesCientificasService } from './actividades_cientificas.service';
import { ActividadesCientificasController } from './actividades_cientificas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActividadesCientifica } from './entities/actividades_cientifica.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActividadesCientifica])],
  controllers: [ActividadesCientificasController],
  providers: [ActividadesCientificasService],
})
export class ActividadesCientificasModule {}
