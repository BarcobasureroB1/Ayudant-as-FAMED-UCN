import { Injectable } from '@nestjs/common';
import { CreateParticipantesActaDto } from './dto/create-participantes_acta.dto';


@Injectable()
export class ParticipantesActaService {
  create(createParticipantesActaDto: CreateParticipantesActaDto) {
    return 'This action adds a new participantesActa';
  }

  findAll() {
    return `This action returns all participantesActa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} participantesActa`;
  }

  update(id: number) {
    return `This action updates a #${id} participantesActa`;
  }

  remove(id: number) {
    return `This action removes a #${id} participantesActa`;
  }
}
