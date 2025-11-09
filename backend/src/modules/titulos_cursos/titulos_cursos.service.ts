import { Injectable } from '@nestjs/common';
import { CreateTitulosCursoDto } from './dto/create-titulos_curso.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TitulosCurso } from './entities/titulos_curso.entity';


@Injectable()
export class TitulosCursosService {
 constructor(
  @InjectRepository(TitulosCurso)
  private readonly titulosCursosRepository: Repository<TitulosCurso>,
 ) {}
  async findByAlumno(rut_alumno: string) {
    const titulos = await this.titulosCursosRepository.find({
      where: { usuario: { rut: rut_alumno } },
    });
    if (!titulos) {
      return null;
    }
    return titulos;
  }
}