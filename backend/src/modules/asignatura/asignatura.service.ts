import { Injectable } from '@nestjs/common';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignatura } from './entities/asignatura.entity';


@Injectable()
export class AsignaturaService {
  constructor( 
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
  ) {}
  create(createAsignaturaDto: CreateAsignaturaDto) {
    const asignatura = this.asignaturaRepository.create(createAsignaturaDto);
    return this.asignaturaRepository.save(asignatura);
  }

  findAvaibleAsignaturas() {
    return ;
  }
}
