import { Injectable } from '@nestjs/common';
import { CreateAyudantiaDto } from './dto/create-ayudantia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ayudantia } from './entities/ayudantia.entity';


@Injectable()
export class AyudantiaService {
  constructor(
    @InjectRepository(Ayudantia)
    private readonly ayudantiaRepository: Repository<Ayudantia>,
  ) {}

  async findByUsuario(rut: string) {
    const ayudantias = await this.ayudantiaRepository.find({
      where: { alumno: { rut } },
      relations: ['asignatura', 'coordinador', 'alumno'],
    });
    if (!ayudantias) {
      return null;
    }
    return ayudantias;
  }
}
