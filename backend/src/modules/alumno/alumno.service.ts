import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAlumnoDto } from './dto/create-alumno.dto';
import { UpdateAlumnoDto } from './dto/update-alumno.dto';
import { Repository } from 'typeorm';
import { Alumno } from './entities/alumno.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class AlumnoService {
  constructor(
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}
  async create(createAlumnoDto: CreateAlumnoDto) {

    const alumno = await this.alumnoRepository.create(createAlumnoDto);
    return this.alumnoRepository.save(alumno);
  }

  async findByRut(rut: string) {
    return await this.alumnoRepository.findOneBy({ rut_alumno: rut });
  }

  async findall() {
    const result = await this.alumnoRepository
      .createQueryBuilder('alumno')
      .innerJoin(Usuario, 'usuario', 'usuario.rut = alumno.rut_alumno')
      .select([
        'alumno.rut_alumno',
        'alumno.nombres',
        'alumno.apellidos',
        'alumno.correo',
        'alumno.fecha_admision',
        'alumno.codigo_carrera',
        'alumno.nombre_carrera',
        'alumno.promedio',
        'alumno.nivel',
        'alumno.periodo',
        'usuario.deshabilitado',
      ])
      .getRawMany();

    return result.map((row) => ({
      rut_alumno: row.alumno_rut_alumno,
      nombres: row.alumno_nombres,
      apellidos: row.alumno_apellidos,
      correo: row.alumno_correo,
      fecha_admision: row.alumno_fecha_admision,
      codigo_carrera: row.alumno_codigo_carrera,
      nombre_carrera: row.alumno_nombre_carrera,
      promedio: row.alumno_promedio,
      nivel: row.alumno_nivel,
      periodo: row.alumno_periodo,
      deshabilitado: row.usuario_deshabilitado,
    }));
  }
}
