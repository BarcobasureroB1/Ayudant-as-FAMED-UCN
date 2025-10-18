import { Injectable } from '@nestjs/common';
import { CreateFirmasActaDto } from './dto/create-firmas_acta.dto';


@Injectable()
export class FirmasActaService {
  create(createFirmasActaDto: CreateFirmasActaDto) {
    return 'This action adds a new firmasActa';
  }

  findAll() {
    return `This action returns all firmasActa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} firmasActa`;
  }

  update(id: number) {
    return `This action updates a #${id} firmasActa`;
  }

  remove(id: number) {
    return `This action removes a #${id} firmasActa`;
  }
}
