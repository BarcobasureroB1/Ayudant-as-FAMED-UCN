import { Module } from '@nestjs/common';
import { ActaService } from './acta.service';
import { ActaController } from './acta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Acta } from './entities/acta.entity';
import { FirmasActa } from '../firmas_acta/entities/firmas_acta.entity';
import { ParticipantesActa } from '../participantes_acta/entities/participantes_acta.entity';
import { Departamento } from '../departamento/entities/departamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Acta,FirmasActa,ParticipantesActa,Departamento])],
  controllers: [ActaController],
  providers: [ActaService],
})
export class ActaModule {}
