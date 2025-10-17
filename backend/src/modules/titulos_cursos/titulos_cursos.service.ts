import { Injectable } from '@nestjs/common';
import { CreateTitulosCursoDto } from './dto/create-titulos_curso.dto';


@Injectable()
export class TitulosCursosService {
  create(createTitulosCursoDto: CreateTitulosCursoDto) {
    return 'This action adds a new titulosCurso';
  }

  findAll() {
    return `This action returns all titulosCursos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} titulosCurso`;
  }

  update(id: number) {
    return `This action updates a #${id} titulosCurso`;
  }

  remove(id: number) {
    return `This action removes a #${id} titulosCurso`;
  }
}
