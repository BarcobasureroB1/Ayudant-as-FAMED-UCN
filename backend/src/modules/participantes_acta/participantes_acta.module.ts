import { Module } from '@nestjs/common';
import { ParticipantesActaService } from './participantes_acta.service';
import { ParticipantesActaController } from './participantes_acta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantesActa } from './entities/participantes_acta.entity';
@Module({
  imports: [TypeOrmModule.forFeature([ParticipantesActa])],
  controllers: [ParticipantesActaController],
  providers: [ParticipantesActaService],
})
export class ParticipantesActaModule {}
