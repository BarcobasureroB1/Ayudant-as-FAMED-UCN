import { Injectable } from '@nestjs/common';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';


@Injectable()
export class AsignaturaService {
  create(createAsignaturaDto: CreateAsignaturaDto) {
    return 'This action adds a new asignatura';
  }

  findAll() {
    return `This action returns all asignatura`;
  }

  findOne(id: number) {
    return `This action returns a #${id} asignatura`;
  }

  update(id: number) {
    return `This action updates a #${id} asignatura`;
  }

  remove(id: number) {
    return `This action removes a #${id} asignatura`;
  }
}
