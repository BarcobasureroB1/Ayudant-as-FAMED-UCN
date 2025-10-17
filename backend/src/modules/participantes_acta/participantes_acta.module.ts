import { Module } from '@nestjs/common';
import { ParticipantesActaService } from './participantes_acta.service';
import { ParticipantesActaController } from './participantes_acta.controller';

@Module({
  controllers: [ParticipantesActaController],
  providers: [ParticipantesActaService],
})
export class ParticipantesActaModule {}
