import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAsignaturaAlumnoDto } from './dto/create-asignatura_alumno.dto';
import { UpdateAsignaturaAlumnoDto } from './dto/update-asignatura_alumno.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignaturaAlumno } from './entities/asignatura_alumno.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';

@Injectable()
export class AsignaturaAlumnoService {
  constructor(
    @InjectRepository(AsignaturaAlumno)
    private readonly asignaturaAlumnoRepository: Repository<AsignaturaAlumno>,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(Asignatura) 
    private readonly asignaturaRepository: Repository<Asignatura>,
  ) {}
  async create(createAsignaturaAlumnoDto: CreateAsignaturaAlumnoDto) {
    const alumno = await this.alumnoRepository.findOneBy({ rut_alumno: createAsignaturaAlumnoDto.rut_alumno });
    if (!alumno) {
      throw new NotFoundException('Alumno no encontrado');
    }

    const asignatura = await this.asignaturaRepository.findOneBy({ nombre: createAsignaturaAlumnoDto.nombre_asignatura });
    if (!asignatura) {
      throw new NotFoundException('Asignatura no encontrada');
    }

    const asignaturaAlumno = this.asignaturaAlumnoRepository.create({
      ...createAsignaturaAlumnoDto,
      alumno,
      asignatura,
    });

    return await this.asignaturaAlumnoRepository.save(asignaturaAlumno);
  }
  async findPostulablesByRut(rut_alumno: string) {
    return await this.asignaturaAlumnoRepository
      .createQueryBuilder('aa')
      .innerJoinAndSelect('aa.asignatura', 'asignatura')
      .innerJoinAndSelect('aa.alumno', 'alumno')
      .where('alumno.rut_alumno = :rut', { rut: rut_alumno })
      .andWhere('asignatura.estado = :estado', { estado: 'abierta' })
      .andWhere('aa.nota IS NOT NULL')
      .getMany();
  }

  async findAll() {
    return await this.asignaturaAlumnoRepository.find();
  }


}
