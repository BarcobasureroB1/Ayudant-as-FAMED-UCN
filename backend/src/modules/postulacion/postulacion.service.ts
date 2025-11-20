import { Injectable } from '@nestjs/common';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postulacion } from './entities/postulacion.entity';
import { Ayudantia } from '../ayudantia/entities/ayudantia.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { In } from 'typeorm';
import { DescartarDto } from './dto/descartar.dto';


@Injectable()
export class PostulacionService {
  constructor(
    
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Coordinador)
    private readonly coordinadorRepository: Repository<Coordinador>,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
  ) {}
  async create(createPostulacionDto: CreatePostulacionDto) {
    const usuario = await this.usuarioRepository.findOneBy({ rut: createPostulacionDto.rut_alumno });
    if (!usuario) {
      return null;
    }

    const asignatura = await this.asignaturaRepository.findOneBy({ id: createPostulacionDto.id_asignatura });
    if (!asignatura) {
      return null;
    }

    const postulacion = this.postulacionRepository.create({
      ...createPostulacionDto,
      usuario,
      asignatura,
    });
    console.log('Postulacion to be saved:', postulacion);
    return this.postulacionRepository.save(postulacion);
  }
  async cancel(id: number) {
    const postulacion = await this.postulacionRepository.findOneBy({ id });
    if (!postulacion) {
      return null;
    }
    postulacion.cancelada_por_usuario = true;
    return this.postulacionRepository.save(postulacion);
  }

  async findcurrent(rut_alumno: string) {
  return await this.postulacionRepository
    .createQueryBuilder('postulacion')
    .leftJoin('postulacion.usuario', 'usuario')
    .leftJoin('postulacion.asignatura', 'asignatura')
    .select([
      'postulacion.id AS id',
      'asignatura.nombre AS nombre_asignatura',
      'postulacion.descripcion_carta AS descripcion_carta',
      'postulacion.correo_profe AS correo_profe',
      'postulacion.actividad AS actividad',
      'postulacion.metodologia AS metodologia',
      'postulacion.dia AS dia',
      'postulacion.bloque AS bloque',
      'postulacion.cancelada_por_usuario AS estado',

    ])
    .where('usuario.rut = :rut', { rut: rut_alumno })
    .andWhere('postulacion.cancelada_por_usuario = false')
    .andWhere('postulacion.rechazada_por_jefatura = false')
    .andWhere('postulacion.es_actual = true')
    .getRawMany();
}

  /**
   * Lista todas las postulaciones cuyo campo `es_actual` es true.
   * Devuelve objetos planos con: id, alumno (rut/nombres/apellidos), descripcion_carta,
   * correo_profe, actividad, metodologia, dia, bloque, puntuacion_etapa1, puntuacion_etapa2
   */
  async findAllCurrent() {
    const rows = await this.postulacionRepository
      .createQueryBuilder('postulacion')
      .leftJoin('postulacion.usuario', 'usuario')
      .select([
        'postulacion.id AS id',
        'usuario.rut AS alumno_rut',
        'usuario.nombres AS alumno_nombres',
        'usuario.apellidos AS alumno_apellidos',
        'postulacion.descripcion_carta AS descripcion_carta',
        'postulacion.correo_profe AS correo_profe',
        'postulacion.actividad AS actividad',
        'postulacion.metodologia AS metodologia',
        'postulacion.dia AS dia',
        'postulacion.bloque AS bloque',
        'postulacion.puntuacion_etapa1 AS puntuacion_etapa1',
        'postulacion.puntuacion_etapa2 AS puntuacion_etapa2',
      ])
      .where('postulacion.es_actual = :actual', { actual: true })
      .getRawMany();

    return rows.map((r) => ({
      id: r.id,
      alumno: {
        rut: r.alumno_rut,
        nombres: r.alumno_nombres,
        apellidos: r.alumno_apellidos,
      },
      descripcion_carta: r.descripcion_carta,
      correo_profe: r.correo_profe,
      actividad: r.actividad,
      metodologia: r.metodologia,
      dia: r.dia,
      bloque: r.bloque,
      puntuacion_etapa1: Number(r.puntuacion_etapa1) || 0,
      puntuacion_etapa2: Number(r.puntuacion_etapa2) || 0,
    }));
  }

  /**
   * Devuelve las postulaciones asociadas a las asignaturas que coordina
   * el usuario identificado por `rutCoordinador`. Usa los datos del
   * `usuario` asignado a la postulacion para rellenar `alumno`.
   */
  async findPostulacionesByCoordinadorRut(rutCoordinador: string) {
    // 1) obtener ids de asignaturas donde este usuario es coordinador actual
    const rows = await this.coordinadorRepository
      .createQueryBuilder('c')
      .innerJoin('c.usuario', 'usuario')
      .innerJoin('c.asignaturas', 'asignatura')
      .where('usuario.rut = :rut', { rut: rutCoordinador })
      .andWhere('c.actual = :actual', { actual: true })
      .select(['asignatura.id AS asignatura_id'])
      .getRawMany();

    const asignaturaIds = rows.map((r) => r.asignatura_id).filter(Boolean);
    if (asignaturaIds.length === 0) return [];

    // 2) obtener postulaciones actuales asociadas a esas asignaturas
    const postulaciones = await this.postulacionRepository
      .createQueryBuilder('p')
      .leftJoin('p.usuario', 'usuario')
      .leftJoin('p.asignatura', 'asignatura')
      .select([
        'p.id AS id',
        'usuario.rut AS rut_alumno',
        'usuario.nombres AS alumno_nombres',
        'usuario.apellidos AS alumno_apellidos',
        'usuario.correo AS alumno_correo',
        'asignatura.id AS id_asignatura',
        'p.descripcion_carta AS descripcion_carta',
        'p.metodologia AS metodologia',
        'p.puntuacion_etapa1 AS puntuacion_etapa1',
        'p.puntuacion_etapa2 AS puntuacion_etapa2',
        'p.motivo_descarte AS motivo_descarte',
        'p.fecha_descarte AS fecha_descarte',
        'p.rechazada_por_jefatura AS rechazada_por_jefatura',
      ])
      .where('asignatura.id IN (:...ids)', { ids: asignaturaIds })
      .andWhere('p.es_actual = :actual', { actual: true })
      .getRawMany();

    // 3) mapear a la forma solicitada
    return postulaciones.map((r) => ({
      id: Number(r.id),
      rut_alumno: r.rut_alumno,
      alumno: {
        rut: r.rut_alumno,
        nombres: r.alumno_nombres,
        apellidos: r.alumno_apellidos,
        correo: r.alumno_correo,
      },
      id_asignatura: Number(r.id_asignatura),
      descripcion_carta: r.descripcion_carta,
      metodologia: r.metodologia,
      puntuacion_etapa1: Number(r.puntuacion_etapa1) || 0,
      puntuacion_etapa2: r.puntuacion_etapa2 !== null && r.puntuacion_etapa2 !== undefined ? Number(r.puntuacion_etapa2) : null,
      motivo_descarte: r.motivo_descarte || null,
      fecha_descarte: r.fecha_descarte || null,
      rechazada_por_jefatura: Boolean(r.rechazada_por_jefatura),
    }));
  }

  /**
   * Actualiza una postulacion parcialmente. Los campos opcionales en el DTO
   * se mantienen si no vienen en la petición.
   * editDto: { id: number, rut_alumno?, id_asignatura?, nombre_asignatura?, descripcion_carta?, correo_profe?, actividad?, metodologia?, dia?, bloque? }
   */
  async update(editDto: any) {
    const id = editDto.id;
    if (!id) return null;

    const postulacion = await this.postulacionRepository.findOne({ where: { id }, relations: ['usuario', 'asignatura'] });
    if (!postulacion) return null;

    // Si viene rut_alumno, buscar usuario y asignarlo
    if (editDto.rut_alumno !== undefined) {
      const usuario = await this.usuarioRepository.findOneBy({ rut: editDto.rut_alumno });
      if (!usuario) return null;
      postulacion.usuario = usuario;
    }

    // Si viene id_asignatura, buscar asignatura por id y asignar
    if (editDto.id_asignatura !== undefined) {
      const asignatura = await this.asignaturaRepository.findOneBy({ id: editDto.id_asignatura });
      if (!asignatura) return null;
      postulacion.asignatura = asignatura;
    }

    // Si viene nombre_asignatura, buscar por nombre y asignar (alternativa a id)
    if (editDto.nombre_asignatura !== undefined) {
      const asignaturaByName = await this.asignaturaRepository.findOneBy({ nombre: editDto.nombre_asignatura });
      if (!asignaturaByName) return null;
      postulacion.asignatura = asignaturaByName;
    }

    // Campos sencillos: si vienen, sobrescribir
    if (editDto.descripcion_carta !== undefined) postulacion.descripcion_carta = editDto.descripcion_carta;
    if (editDto.correo_profe !== undefined) postulacion.correo_profe = editDto.correo_profe;
    if (editDto.actividad !== undefined) postulacion.actividad = editDto.actividad;
    if (editDto.metodologia !== undefined) postulacion.metodologia = editDto.metodologia;
    if (editDto.dia !== undefined) postulacion.dia = editDto.dia;
    if (editDto.bloque !== undefined) postulacion.bloque = editDto.bloque;

    // Guardar y devolver
    return await this.postulacionRepository.save(postulacion);
  }

  async puntuacionetapa2(id: number, puntuacion_etapa2: number) {
    const postulacion = await this.postulacionRepository.findOneBy({ id });
    if (!postulacion) {
      return null;
    }
    postulacion.puntuacion_etapa2 = puntuacion_etapa2;
    return await this.postulacionRepository.save(postulacion);
  }
  async rechazarPorJefatura(id: number, dto: DescartarDto) {
    const postulacion = await this.postulacionRepository.findOneBy({ id });
    if (!postulacion) {
      return null;
    }
    postulacion.rechazada_por_jefatura = true;
    postulacion.motivo_descarte = dto.motivo_descarte;
    postulacion.fecha_descarte = dto.fecha_descarte;
    return await this.postulacionRepository.save(postulacion);
  }

  
}
