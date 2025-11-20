import { Injectable } from '@nestjs/common';
import { CreateAyudantiaDto } from './dto/create-ayudantia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ayudantia } from './entities/ayudantia.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';
import { In } from 'typeorm';


@Injectable()
export class AyudantiaService {
  constructor(
    @InjectRepository(Ayudantia)
    private readonly ayudantiaRepository: Repository<Ayudantia>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Coordinador)
    private readonly coordinadorRepository: Repository<Coordinador>,
  ) {}

  async create(dto:CreateAyudantiaDto){
    const asignatura = await this.asignaturaRepository.findOneBy({ id: dto.id_asignatura });
    if (!asignatura) {
      return null;
    }
    const alumno = await this.usuarioRepository.findOneBy({ rut: dto.rut_alumno });
    if (!alumno) {
      return null;
    }
    const coordinador = await this.usuarioRepository.findOneBy({ rut: dto.rut_coordinador_otro });
    if (!coordinador) {
      return null;
    }
    
    const entity = this.ayudantiaRepository.create({
      alumno,
      asignatura,
      evaluacion: dto.evaluacion,
      coordinador,
      periodo: dto.periodo,
      remunerada: dto.remunerada,
      tipo_ayudantia: dto.tipo_ayudantia,
    });

    // Persistir la entidad en la base de datos y devolver la entidad guardada.
    return await this.ayudantiaRepository.save(entity);
  }

  async findByUsuario(rut: string) {
    console.log('Finding ayudantias for rut:', rut);
    const raws = await this.ayudantiaRepository
      .createQueryBuilder('ayudantia')
      .leftJoin('ayudantia.alumno', 'alumno')
      .leftJoin('ayudantia.asignatura', 'asignatura')
      .leftJoin('ayudantia.coordinador', 'coordinador')
      // Además unimos la tabla `alumno` para obtener datos específicos
      // que no están en `usuario`, como `nombre_carrera`.
      .leftJoin(Alumno, 'alumno_data', 'alumno_data.rut_alumno = ayudantia.rut_alumno')
      // Filtrar por la columna física en la tabla `ayudantia` para cubrir
      // ambos roles: alumno o coordinador.
      .select([
        'ayudantia.id AS id',
        'ayudantia.evaluacion AS evaluacion',
        'ayudantia.periodo AS periodo',
        'ayudantia.remunerada AS remunerada',
        'ayudantia.tipo_ayudantia AS tipo_ayudantia',
        'alumno.rut AS alumno_rut',
        'alumno.nombres AS alumno_nombres',
        'alumno.apellidos AS alumno_apellidos',
        'coordinador.rut AS coord_rut',
        'coordinador.nombres AS coord_nombres',
        'coordinador.apellidos AS coord_apellidos',
        'asignatura.id AS asignatura_id',
        'asignatura.nombre AS asignatura_nombre',
        'alumno_data.nombre_carrera AS alumno_nombre_carrera',
      ])
      .where('ayudantia.rut_alumno = :rut OR ayudantia.rut_coordinador_otro = :rut', { rut })
      .getRawMany();
      console.log('Raw ayudantia records:', raws);

    const mapped = raws.map(r => ({
      id: r.id,
      evaluacion: r.evaluacion !== null && r.evaluacion !== undefined ? Number(r.evaluacion) : null,
      periodo: r.periodo,
      remunerada: r.remunerada,
      tipo_ayudantia: r.tipo_ayudantia,
      alumno: r.alumno_rut ? { rut: r.alumno_rut, nombres: r.alumno_nombres, apellidos: r.alumno_apellidos, nombre_carrera: r.alumno_nombre_carrera ?? null } : null,
      coordinador: r.coord_rut ? { rut: r.coord_rut, nombres: r.coord_nombres, apellidos: r.coord_apellidos } : null,
      asignatura: r.asignatura_id ? { id: r.asignatura_id, nombre: r.asignatura_nombre } : null,
    }));

    return mapped;
  }

  /**
   * Devuelve las ayudantías asociadas a las asignaturas que coordina el usuario
   * identificado por `rut`. Retorna en el formato `AyudanteActivoData`.
   */
  async findAyudantiasByCoordinadorRut(rut: string) {
    // 1) obtener ids de asignaturas donde este usuario es coordinador actual
    const rows = await this.coordinadorRepository
      .createQueryBuilder('c')
      .innerJoin('c.usuario', 'usuario')
      .innerJoin('c.asignaturas', 'asignatura')
      .where('usuario.rut = :rut', { rut })
      .andWhere('c.actual = :actual', { actual: true })
      .select(['asignatura.id AS asignatura_id'])
      .getRawMany();

    const asignaturaIds = Array.from(new Set(rows.map((r) => r.asignatura_id).filter(Boolean)));
    if (asignaturaIds.length === 0) return [];

    // 2) obtener ayudantias cuya asignatura esté en la lista
    const raws = await this.ayudantiaRepository
      .createQueryBuilder('ayudantia')
      .leftJoin('ayudantia.alumno', 'alumno')
      .leftJoin('ayudantia.asignatura', 'asignatura')
      .select([
        'ayudantia.id AS id',
        'alumno.rut AS alumno_rut',
        'alumno.nombres AS alumno_nombres',
        'alumno.apellidos AS alumno_apellidos',
        'asignatura.nombre AS asignatura_nombre',
        'ayudantia.periodo AS periodo',
        'ayudantia.evaluacion AS evaluacion',
      ])
      .where('asignatura.id IN (:...ids)', { ids: asignaturaIds })
      .getRawMany();

    return raws.map((r) => ({
      id: Number(r.id),
      rut_alumno: r.alumno_rut,
      alumno: {
        nombres: r.alumno_nombres,
        apellidos: r.alumno_apellidos,
      },
      asignatura: r.asignatura_nombre,
      periodo: r.periodo,
      evaluacion: r.evaluacion !== null && r.evaluacion !== undefined ? Number(r.evaluacion) : null,
    }));
  }

  async evaluarAyudantia(id: number, dto: evaluarAyudantiaDto) {
    const ayudantia = await this.ayudantiaRepository.findOneBy({ id });
    if (!ayudantia) {
      return null;
    } 
    ayudantia.evaluacion = dto.evaluacion;
    return this.ayudantiaRepository.save(ayudantia);
  }


  
}
