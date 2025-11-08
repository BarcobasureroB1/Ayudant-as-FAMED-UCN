import { Injectable } from '@nestjs/common';
import { CreateActividadesCientificaDto } from './dto/create-actividades_cientifica.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadesCientifica } from './entities/actividades_cientifica.entity';


@Injectable()
export class ActividadesCientificasService {
  constructor(
    @InjectRepository(ActividadesCientifica)
    private readonly actividadesCientificaRepository: Repository<ActividadesCientifica>,
  ) {}

  findAll() {
    return `This action returns all actividadesCientificas`;
  }

 

  async findByAlumno(rut_alumno: string) {
    const actividades = await this.actividadesCientificaRepository.find({
      where: { alumno: { rut_alumno } },
    });
    if (!actividades) {
      return null;
    }
    return actividades;
  }
}
