import { Injectable } from '@nestjs/common';
import { CreateParticipantesActaDto } from './dto/create-participantes_acta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticipantesActa } from './entities/participantes_acta.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ParticipantesActaService {
  constructor(
    @InjectRepository(ParticipantesActa)
    private readonly participantesActaRepository: Repository<ParticipantesActa>,
  ) {}
  create(createParticipantesActaDto: CreateParticipantesActaDto) {
    const participantesActa = this.participantesActaRepository.create(createParticipantesActaDto);
    return this.participantesActaRepository.save(participantesActa);
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
