import { Injectable, Logger } from '@nestjs/common';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignatura } from './entities/asignatura.entity';
import { AsignaturaAlumno } from '../asignatura_alumno/entities/asignatura_alumno.entity';
import { Not, IsNull } from 'typeorm';
import { Departamento } from '../departamento/entities/departamento.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';
import { UsuarioService } from '../usuario/usuario.service';
import { AlumnoService } from '../alumno/alumno.service';
import { Alumno } from '../alumno/entities/alumno.entity';


@Injectable()
export class AsignaturaService {
  private readonly logger = new Logger(AsignaturaService.name);
  constructor( 
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Departamento)
    private readonly depa: Repository<Departamento>,
    private readonly depaservice: UsuarioService,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    @InjectRepository(AsignaturaAlumno)
    private readonly asignaturaAlumnoRepository: Repository<AsignaturaAlumno>,
  ) {}
  async create(createAsignaturaDto: CreateAsignaturaDto) {
    const departamento = await this.depa.findOne({ where: { nombre: createAsignaturaDto.Departamento } });
    if (!departamento) {
      return null;
    }
    const asignatura = new Asignatura();
    asignatura.nombre = createAsignaturaDto.nombre;
    asignatura.nrc = createAsignaturaDto.nrc;
    asignatura.semestre = createAsignaturaDto.semestre;
    if (createAsignaturaDto.estado) {
      asignatura.estado = createAsignaturaDto.estado;
    }
    if (createAsignaturaDto.abierta_postulacion !== undefined) {
      asignatura.abierta_postulacion = createAsignaturaDto.abierta_postulacion;
    }
    // ManyToMany relation expects an array of departamentos
    asignatura.departamentos = [departamento];

    return await this.asignaturaRepository.save(asignatura);
  }

  async findAvaibleAsignaturas(rut_alumno) {
    const alumno = await this.alumnoRepository.findOne({ where: { rut_alumno: rut_alumno } } );
    if (alumno) {
      const nivel = alumno.nivel;
      // Filtrar asignaturas por semestre/estado y asegurarse que exista
      // una fila en asignatura_alumno (asignaturasAlumnos) para este alumno
      // con una nota (nota IS NOT NULL). Usamos innerJoin para requerir
      // la relación.
      this.logger.debug(`Buscando asignaturas para alumno ${alumno.rut_alumno} (nivel ${nivel})`);

      // Primero consultamos la tabla asignatura_alumno para evitar problemas
      // con nombres de columnas FK o alias. Hacemos join a alumno/asignatura
      // y pedimos sólo filas con nota no nula.
      const aas = await this.asignaturaAlumnoRepository
        .createQueryBuilder('aa')
        .innerJoinAndSelect('aa.asignatura', 'asignatura')
        .innerJoin('aa.alumno', 'alumno')
        .where('alumno.rut_alumno = :rut', { rut: alumno.rut_alumno })
        .andWhere('aa.nota IS NOT NULL')
        .getMany();

      this.logger.debug(`asignatura_alumno rows found: ${aas.length}`);

      // Filtrar por semestre y estado, mapear a objetos planos
      const estados = ['abierto', 'habilitada'];
      const result = aas
        .filter((aa) => aa.asignatura && aa.asignatura.semestre <= nivel && estados.includes(aa.asignatura.estado))
        .map((aa) => ({
          id: aa.asignatura.id,
          nombre: aa.asignatura.nombre,
          semestre: aa.asignatura.semestre,
          nrc: aa.asignatura.nrc,
          estado: aa.asignatura.estado,
          nota: aa.nota,
        }));

      return result;
    }
    return null;
  }

  async findpostulablesByRut(rut_alumno: string) {
    const postulables = await this.asignaturaRepository.find({
      where: {
        estado: 'abierto',
        asignaturasAlumnos: {
          alumno: {
            rut_alumno: rut_alumno,
          },
          nota: Not(IsNull()),
        },

      }
  });
    return postulables;
}

  async findAll() {
    return await this.asignaturaRepository.find();
  }

  /**
   * Devuelve las asignaturas que pertenecen a un departamento dado (por id)
   * en el formato solicitado por el cliente.
   */
  async findByDepartamentoId(departamentoId: number) {
    const asignaturas = await this.asignaturaRepository
      .createQueryBuilder('asignatura')
      .innerJoin('asignatura.departamentos', 'departamento', 'departamento.id = :depId', { depId: departamentoId })
      .getMany();

    return asignaturas.map((a) => ({
      id: a.id,
      nombre: a.nombre,
      estado: a.estado,
      semestre: String(a.semestre),
      nrc: a.nrc,
      abierta_postulacion: a.abierta_postulacion,
    }));
  }

  //cambia el estado de una asignatura a pendiente
  async estadoAsignatura(id: number) {
    const asignatura = await this.asignaturaRepository.findOneBy({ id });
    if (!asignatura) {
      return null;
    } 
    asignatura.estado = 'pendiente';
    return await this.asignaturaRepository.save(asignatura);
  }
  //cambia el estado de una asignatura a cerrado y deshabilita postulaciones
  async cerrarAsignatura(id: number) {
    const asignatura = await this.asignaturaRepository.findOneBy({ id });
    if (!asignatura) {
      return null;
    }
    asignatura.estado = 'cerrado';
    asignatura.abierta_postulacion = false;
    return await this.asignaturaRepository.save(asignatura);
  }

  async findwithcoordinador(DepartamentoId: number) {
    console.log("ENTRE AQUI CON DEPARTAMENTO ID: ", DepartamentoId);
    // Seleccionamos columnas planas para evitar ciclos y devolver
    // explícitamente el rut, nombres y apellidos del usuario
    // que actúa como coordinador (sólo si existe un registro
    // en la tabla Coordinador con actual = true).
    const rows = await this.asignaturaRepository
      .createQueryBuilder('asignatura')
      .innerJoin('asignatura.departamentos', 'departamento', 'departamento.id = :depId', { depId: DepartamentoId })
      .innerJoin('asignatura.coordinador', 'coord', 'coord.actual = :actual', { actual: true })
      .innerJoin('coord.usuario', 'usuario')
      .select([
        'asignatura.id',
        'asignatura.nombre',
        'asignatura.estado',
        'asignatura.semestre',
        'asignatura.nrc',
        'asignatura.abierta_postulacion',
        'usuario.rut',
        'usuario.nombres',
        'usuario.apellidos',
        'coord.rut_coordinador',
      ])
      .getRawMany();

    return rows.map((r) => ({
      id: r.asignatura_id,
      nombre: r.asignatura_nombre,
      estado: r.asignatura_estado,
      semestre: String(r.asignatura_semestre),
      nrc: r.asignatura_nrc,
      abierta_postulacion: r.asignatura_abierta_postulacion,
      coordinador : { rut: r.usuario_rut, nombres: r.usuario_nombres, apellidos: r.usuario_apellidos }
    }));
  }

  
  async findallwithcoordinador() {
    console.log("ENTRE AQUI");
    const rows = await this.asignaturaRepository
      .createQueryBuilder('asignatura')
      .innerJoin('asignatura.departamentos', 'departamento')
      .innerJoin('asignatura.coordinador', 'coord', 'coord.actual = :actual', { actual: true })
      .innerJoin('coord.usuario', 'usuario')
      .select([
        'asignatura.id',
        'asignatura.nombre',
        'asignatura.estado',
        'asignatura.semestre',
        'asignatura.nrc',
        'asignatura.abierta_postulacion',
        'usuario.rut',
        'usuario.nombres',
        'usuario.apellidos',
        'coord.rut_coordinador',
      ])
      .getRawMany();
    return rows.map((r) => ({
      id: r.asignatura_id,
      nombre: r.asignatura_nombre,
      estado: r.asignatura_estado,
      semestre: String(r.asignatura_semestre),
      nrc: r.asignatura_nrc,
      abierta_postulacion: r.asignatura_abierta_postulacion,
      coordinador : { rut: r.usuario_rut, nombres: r.usuario_nombres, apellidos: r.usuario_apellidos }
    }));
    
  }


}
