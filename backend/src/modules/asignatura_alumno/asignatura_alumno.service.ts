import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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

    // Verificar si ya existe una relación para este alumno y esta asignatura
    const existing = await this.asignaturaAlumnoRepository.findOne({
      where: {
        alumno: { rut_alumno: alumno.rut_alumno },
        asignatura: { id: asignatura.id },
      },
      relations: ['alumno', 'asignatura'],
    });

    if (existing) {
      // Si ya existe, actualizar la nota y sumar 1 a la oportunidad
      existing.nota = createAsignaturaAlumnoDto.nota;
      existing.oportunidad = (existing.oportunidad ?? 1) + 1;
      return await this.asignaturaAlumnoRepository.save(existing);
    }

    // Si no existe, crear nueva entrada
    const asignaturaAlumno = this.asignaturaAlumnoRepository.create({
      ...createAsignaturaAlumnoDto,
      alumno,
      asignatura,
    });

    return await this.asignaturaAlumnoRepository.save(asignaturaAlumno);
  }
  

  async findAll() {
    return await this.asignaturaAlumnoRepository.find();
  }


}
