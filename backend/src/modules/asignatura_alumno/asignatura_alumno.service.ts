import { Injectable } from '@nestjs/common';
import { CreateAsignaturaAlumnoDto } from './dto/create-asignatura_alumno.dto';
import { UpdateAsignaturaAlumnoDto } from './dto/update-asignatura_alumno.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignaturaAlumno } from './entities/asignatura_alumno.entity';

@Injectable()
export class AsignaturaAlumnoService {
  constructor(
    @InjectRepository(AsignaturaAlumno)
    private readonly asignaturaAlumnoRepository: Repository<AsignaturaAlumno>,
  ) {}
  create(createAsignaturaAlumnoDto: CreateAsignaturaAlumnoDto) {
    const asignaturaAlumno = this.asignaturaAlumnoRepository.create(createAsignaturaAlumnoDto);
    return this.asignaturaAlumnoRepository.save(asignaturaAlumno);
  }
  async findPostulablesByRut(rut_alumno: string) {
    return this.asignaturaAlumnoRepository
      .createQueryBuilder('aa')
      .innerJoinAndSelect('aa.asignatura', 'asignatura')
      .innerJoinAndSelect('aa.alumno', 'alumno')
      .where('alumno.rut_alumno = :rut', { rut: rut_alumno })
      .andWhere('asignatura.abierta_postulacion = true')
      .andWhere('aa.nota IS NOT NULL')
      .getMany();
  }


}
