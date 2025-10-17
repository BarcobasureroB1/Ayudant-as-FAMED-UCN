import { Injectable } from '@nestjs/common';
import { CreateActaDto } from './dto/create-acta.dto';


@Injectable()
export class ActaService {
  create(createActaDto: CreateActaDto) {
    return 'This action adds a new acta';
  }

  findAll() {
    return `This action returns all acta`;
  }

  findOne(id: number) {
    return `This action returns a #${id} acta`;
  }

  update(id: number) {
    return `This action updates a #${id} acta`;
  }

  remove(id: number) {
    return `This action removes a #${id} acta`;
  }
}
