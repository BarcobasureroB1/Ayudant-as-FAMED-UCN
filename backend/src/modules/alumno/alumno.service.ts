import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { Repository } from 'typeorm';
import { Alumno } from './entities/alumno.entity';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
  ) {}
  async create(createAlumnoDto: CreateAlumnoDto) {

    const alumno = await this.alumnoRepository.create(createAlumnoDto);
    return this.alumnoRepository.save(alumno);
  }

  async findByRut(rut: string) {
    return await this.alumnoRepository.findOneBy({ rut_alumno: rut });
  }

 
}
