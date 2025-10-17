import { Injectable } from '@nestjs/common';
import { CreateActividadesCientificaDto } from './dto/create-actividades_cientifica.dto';


@Injectable()
export class ActividadesCientificasService {
  create(createActividadesCientificaDto: CreateActividadesCientificaDto) {
    return 'This action adds a new actividadesCientifica';
  }

  findAll() {
    return `This action returns all actividadesCientificas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} actividadesCientifica`;
  }

  update(id: number) {
    return `This action updates a #${id} actividadesCientifica`;
  }

  remove(id: number) {
    return `This action removes a #${id} actividadesCientifica`;
  }
}
