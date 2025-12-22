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
import { DescartarDto } from './dto/descartar.dto';
import { AsignaturaAlumno } from '../asignatura_alumno/entities/asignatura_alumno.entity';
import { EmailService } from '../email/email.service';


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
    @InjectRepository(Ayudantia)
    private readonly ayudantiaRepository: Repository<Ayudantia>,
    @InjectRepository(AsignaturaAlumno)
    private readonly asignaturaAlumnoRepository: Repository<AsignaturaAlumno>,
    private readonly emailService: EmailService,
  ) {}
  async create(createPostulacionDto: CreatePostulacionDto) {
    const usuario = await this.usuarioRepository.findOneBy({ rut: createPostulacionDto.rut_alumno });
    if (!usuario) {
      return null;
    }

    const asignaturaId = Number(createPostulacionDto.id_asignatura);
    if (Number.isNaN(asignaturaId)) {
      return null;
    }

    const asignatura = await this.asignaturaRepository.findOneBy({ id: asignaturaId });
    if (!asignatura) {
      return null;
    }

    // Validar que no se supere el límite de postulantes
    const postulacionesActivas = await this.postulacionRepository.count({
      where: {
        asignatura: { id: asignaturaId },
        cancelada_por_usuario: false,
        rechazada_por_jefatura: false,
      },
    });

    if (postulacionesActivas >= asignatura.limite_postulantes) {
      return null;
    }

    const [alumno, asignaturaAlumno, ayudantiasPrevias, asignaturasAlumnoList] = await Promise.all([
      this.alumnoRepository.findOne({ where: { rut_alumno: createPostulacionDto.rut_alumno } }),
      this.asignaturaAlumnoRepository.findOne({
        where: {
          alumno: { rut_alumno: createPostulacionDto.rut_alumno },
          asignatura: { id: asignaturaId },
        },
        relations: ['alumno', 'asignatura'],
      }),
      this.ayudantiaRepository.find({
        where: { alumno: { rut: createPostulacionDto.rut_alumno } },
        relations: ['asignatura', 'alumno'],
        order: { id: 'DESC' },
      }),
      this.asignaturaAlumnoRepository.find({
        where: { alumno: { rut_alumno: createPostulacionDto.rut_alumno } },
        relations: ['asignatura', 'alumno'],
      }),
    ]);

    const puntuacion_etapa1 = this.calcularPuntuacionEtapa1({
      alumno,
      asignatura,
      asignaturaAlumno,
      ayudantiasPrevias,
      correoProfe: createPostulacionDto.correo_profe,
      asignaturasAlumnoList,
    });

    const postulacion = this.postulacionRepository.create({
      ...createPostulacionDto,
      usuario,
      asignatura,
      puntuacion_etapa1,
    });
   
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
      .andWhere('postulacion.rechazada_por_jefatura = false')
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
  
  async findCurrentByAsignatura(rut_alumno: string, id_asignatura: number) {
    const id = Number(id_asignatura);
    if (Number.isNaN(id)) return null;

    const row = await this.postulacionRepository
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
      .andWhere('asignatura.id = :idAsignatura', { idAsignatura: id })
      .andWhere('postulacion.cancelada_por_usuario = false')
      .andWhere('postulacion.rechazada_por_jefatura = false')
      .andWhere('postulacion.es_actual = true')
      .getRawOne();

    if (!row) return null;
    return {
      id: row.id,
      alumno: {
        rut: row.alumno_rut,
        nombres: row.alumno_nombres,
        apellidos: row.alumno_apellidos,
      },
      asignatura: row.nombre_asignatura,
      descripcion_carta: row.descripcion_carta,
      correo_profe: row.correo_profe,
      actividad: row.actividad,
      metodologia: row.metodologia,
      dia: row.dia,
      bloque: row.bloque,
      puntuacion_etapa1: Number(row.puntuacion_etapa1) || 0,
      puntuacion_etapa2: Number(row.puntuacion_etapa2) || 0,
    };
  }



  /**
   * Devuelve las postulaciones asociadas a las asignaturas que coordina
   * el usuario identificado por `rutCoordinador`. Usa los datos del
   * `usuario` asignado a la postulacion para rellenar `alumno`.
   */
  async findPostulacionesByCoordinadorRut(rutCoordinador: string) {
    const asignaturaIds = await this.getAsignaturaIdsForCoordinador(rutCoordinador);
    if (asignaturaIds.length === 0) return [];
    const postulaciones = await this.getPostulacionesByAsignaturasAndCoordinador(asignaturaIds, rutCoordinador);
    return this.mapPostulacionesForCoordinador(postulaciones);
  }

  // Obtiene IDs de asignaturas donde el coordinador (por rut) es actual
  private async getAsignaturaIdsForCoordinador(rutCoordinador: string): Promise<number[]> {
    const rows = await this.coordinadorRepository
      .createQueryBuilder('c')
      .innerJoin('c.usuario', 'usuario')
      .innerJoin('c.asignaturas', 'asignatura')
      .where('usuario.rut = :rut', { rut: rutCoordinador })
      .andWhere('c.actual = :actual', { actual: true })
      .select(['asignatura.id AS asignatura_id',
        'asignatura.nombre AS nombre_asignatura'
      ])
      .getRawMany();
    return rows.map((r) => r.asignatura_id).filter(Boolean);
  }

  // Obtiene todos los IDs de asignaturas donde cualquier coordinador actual está asignado
  private async getAsignaturaIdsForAllCoordinadores(): Promise<number[]> {
    const rows = await this.coordinadorRepository
      .createQueryBuilder('c')
      .innerJoin('c.asignaturas', 'asignatura')
      .where('c.actual = :actual', { actual: true })
      .select(['asignatura.id AS asignatura_id'])
      .getRawMany();
    // Deduplicar
    return Array.from(new Set(rows.map((r) => r.asignatura_id).filter(Boolean)));
  }

  // Consulta postulaciones actuales por lista de asignaturas (sin filtrar coordinador específico)
  private async getPostulacionesByAsignaturas(asignaturaIds: number[]) {
    return await this.postulacionRepository
      .createQueryBuilder('p')
      .leftJoin('p.usuario', 'usuario')
      .leftJoin('p.asignatura', 'asignatura')
      .leftJoin('asignatura.coordinador', 'coord', 'coord.actual = :actual', { actual: true })
      .leftJoin('coord.usuario', 'coord_usuario')
      .select([
        'p.id AS id',
        'usuario.rut AS rut_alumno',
        'usuario.nombres AS alumno_nombres',
        'usuario.apellidos AS alumno_apellidos',
        'asignatura.id AS id_asignatura',
        'asignatura.nombre AS nombre_asignatura',
        'p.descripcion_carta AS descripcion_carta',
        'p.actividad AS actividad',
        'p.metodologia AS metodologia',
        'p.dia AS dia',
        'p.bloque AS bloque',
        'p.puntuacion_etapa1 AS puntuacion_etapa1',
        'p.puntuacion_etapa2 AS puntuacion_etapa2',
        'p.motivo_descarte AS motivo_descarte',
        'p.cancelada_por_usuario AS cancelada_por_usuario',
        'p.fecha_descarte AS fecha_descarte',
        'p.rechazada_por_jefatura AS rechazada_por_jefatura',
        'coord_usuario.rut AS coordinador_rut',
        'coord_usuario.nombres AS coordinador_nombres',
        'coord_usuario.apellidos AS coordinador_apellidos',
      ])
      .where('asignatura.id IN (:...ids)', { ids: asignaturaIds })
      .andWhere('p.es_actual = :actual', { actual: true })
      .andWhere('p.cancelada_por_usuario = :cancelada', { cancelada: false })
      .getRawMany();
  }

  // Consulta postulaciones actuales por lista de asignaturas y coordinador específico
  private async getPostulacionesByAsignaturasAndCoordinador(asignaturaIds: number[], rutCoordinador: string) {
    return await this.postulacionRepository
      .createQueryBuilder('p')
      .leftJoin('p.usuario', 'usuario')
      .leftJoin('p.asignatura', 'asignatura')
      .innerJoin('asignatura.coordinador', 'coord', 'coord.actual = :actual', { actual: true })
      .innerJoin('coord.usuario', 'coord_usuario', 'coord_usuario.rut = :rut', { rut: rutCoordinador })
      .select([
        'p.id AS id',
        'usuario.rut AS rut_alumno',
        'usuario.nombres AS alumno_nombres',
        'usuario.apellidos AS alumno_apellidos',
        'asignatura.id AS id_asignatura',
        'asignatura.nombre AS nombre_asignatura',
        'p.descripcion_carta AS descripcion_carta',
        'p.actividad AS actividad',
        'p.metodologia AS metodologia',
        'p.dia AS dia',
        'p.bloque AS bloque',
        'p.puntuacion_etapa1 AS puntuacion_etapa1',
        'p.puntuacion_etapa2 AS puntuacion_etapa2',
        'p.cancelada_por_usuario AS cancelada_por_usuario',
        'p.motivo_descarte AS motivo_descarte',
        'p.fecha_descarte AS fecha_descarte',
        'p.rechazada_por_jefatura AS rechazada_por_jefatura',
        'coord_usuario.rut AS coordinador_rut',
        'coord_usuario.nombres AS coordinador_nombres',
        'coord_usuario.apellidos AS coordinador_apellidos',
      ])
      .where('asignatura.id IN (:...ids)', { ids: asignaturaIds })
      .andWhere('p.es_actual = :actual', { actual: true })
      .andWhere('p.cancelada_por_usuario = :cancelada', { cancelada: false })
      .andWhere('coord_usuario.rut = :rutCoordinador', { rutCoordinador })
      .getRawMany();
  }

  // Mapea crudo a formato público
  private mapPostulacionesForCoordinador(rows: any[]) {
    return rows.map((r) => ({
      id: Number(r.id),
      rut_alumno: r.rut_alumno,
      alumno: {
        rut: r.rut_alumno,
        nombres: r.alumno_nombres,
        apellidos: r.alumno_apellidos,
        correo: r.alumno_correo ?? undefined,
      },
      id_asignatura: Number(r.id_asignatura),
      descripcion_carta: r.descripcion_carta,
      nombre_asignatura: r.nombre_asignatura,
      actividad: r.actividad,
      metodologia: r.metodologia,
      puntuacion_etapa1: r.puntuacion_etapa1 !== null && r.puntuacion_etapa1 !== undefined ? Number(r.puntuacion_etapa1) : 0,
      puntuacion_etapa2: r.puntuacion_etapa2 !== null && r.puntuacion_etapa2 !== undefined ? Number(r.puntuacion_etapa2) : null,
      motivo_descarte: r.motivo_descarte || null,
      fecha_descarte: r.fecha_descarte || null,
      rechazada_por_jefatura: Boolean(r.rechazada_por_jefatura),
      coordinador: r.coordinador_rut ? {
        rut: r.coordinador_rut,
        nombres: r.coordinador_nombres,
        apellidos: r.coordinador_apellidos,
      } : null,
    }));
  }

  // Nuevo: Busca postulaciones para todas las asignaturas coordinadas por coordinadores actuales
  async findPostulacionesByCoordinadores() {
    console.log('Buscando postulaciones para todas las asignaturas de coordinadores actuales...');
    const asignaturaIds = await this.getAsignaturaIdsForAllCoordinadores();
    if (asignaturaIds.length === 0) return [];
    const postulaciones = await this.getPostulacionesByAsignaturas(asignaturaIds);
    return this.mapPostulacionesForCoordinador(postulaciones);
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
    const postulacion = await this.postulacionRepository.findOne({
      where: { id },
      relations: ['usuario', 'asignatura'],
    });
    if (!postulacion) {
      return null;
    }
    postulacion.rechazada_por_jefatura = true;
    postulacion.motivo_descarte = dto.motivo_descarte;
    postulacion.fecha_descarte = dto.fecha_descarte;
    await this.postulacionRepository.save(postulacion);

    // Enviar correo al postulante
    const usuario = postulacion.usuario;
    const asignatura = postulacion.asignatura;
    if (usuario && asignatura) {
      // Buscar el alumno asociado al usuario por rut
      const alumno = await this.alumnoRepository.findOneBy({ rut_alumno: usuario.rut });
      if (alumno && alumno.correo) {
        const asunto = `Notificación: Tu postulación ha sido rechazada - ${asignatura.nombre}`;
        const html = `
          <p>Estimado/a ${usuario.nombres} ${usuario.apellidos},</p>
          <p>Lamentamos informarte que tu postulación para la ayudantía de <strong>${asignatura.nombre}</strong> ha sido rechazada por jefatura.</p>
          <p><strong>Motivo:</strong> ${dto.motivo_descarte}</p>
          <p>Si tienes dudas sobre esta decisión, puedes contactar a la coordinación correspondiente.</p>
          <p>Saludos,<br>Sistema de Ayudantías FAMED-UCN</p>
        `;
        await this.emailService.send({
          to: alumno.correo,
          subject: asunto,
          html,
        });
      }
    }

    return postulacion;
  }
  

  private calcularPuntuacionEtapa1(params: {
    alumno: Alumno | null | undefined;
    asignatura: Asignatura | null;
    asignaturaAlumno: AsignaturaAlumno | null;
    ayudantiasPrevias: Ayudantia[];
    asignaturasAlumnoList: AsignaturaAlumno[];
    correoProfe?: string;
  }): number {
    const aprobacionSemestres = this.calcularAprobacionSemestres(
      params.asignaturaAlumno,
      params.alumno,
      params.asignatura,
      params.asignaturasAlumnoList,
    );
    const calificacionAsignatura = this.calcularCalificacionAsignatura(params.asignaturaAlumno);
    const promedioCarrera = this.calcularPromedioCarrera(params.alumno);
    const oportunidadAprobacion = this.calcularOportunidadAprobacion(params.asignaturaAlumno);
    const ayudantiasPrevias = this.calcularAyudantiasPrevias(params.ayudantiasPrevias, params.asignatura?.id);
    const evaluacionAyudantias = this.calcularEvaluacionAyudantias(params.ayudantiasPrevias, params.correoProfe);

    return aprobacionSemestres + calificacionAsignatura + promedioCarrera + oportunidadAprobacion + ayudantiasPrevias + evaluacionAyudantias;
  }

  private calcularAprobacionSemestres(
    asignaturaAlumno: AsignaturaAlumno | null,
    alumno: Alumno | null | undefined,
    asignatura: Asignatura | null,
    asignaturasAlumnoList: AsignaturaAlumno[],
  ): number {
    if (!asignaturaAlumno || asignaturaAlumno.nota === null || asignaturaAlumno.nota === undefined) return 0;
    if (asignaturaAlumno.nota < 4) return 0;

    const atrasoSemestres = this.calcularAtrasoSemestres(alumno, asignatura, asignaturasAlumnoList);
    if (atrasoSemestres <= 0) return 5;
    if (atrasoSemestres === 1) return 3;
    if (atrasoSemestres >= 2) return 1;
    return 0;
  }

  private calcularCalificacionAsignatura(asignaturaAlumno: AsignaturaAlumno | null): number {
    if (!asignaturaAlumno || asignaturaAlumno.nota === null || asignaturaAlumno.nota === undefined) return 0;
    return this.clampConMinimo(asignaturaAlumno.nota, 5, 7);
  }

  private calcularPromedioCarrera(alumno: Alumno | null | undefined): number {
    if (!alumno || alumno.promedio === null || alumno.promedio === undefined) return 0;
    return this.clampConMinimo(alumno.promedio, 5, 7);
  }

  private calcularOportunidadAprobacion(asignaturaAlumno: AsignaturaAlumno | null): number {
    if (!asignaturaAlumno || asignaturaAlumno.oportunidad === null || asignaturaAlumno.oportunidad === undefined) return 0;
    if (asignaturaAlumno.oportunidad === 1) return 2;
    if (asignaturaAlumno.oportunidad === 2) return 1;
    return 0;
  }

  private calcularAyudantiasPrevias(ayudantiasPrevias: Ayudantia[], asignaturaId?: number): number {
    if (!ayudantiasPrevias || ayudantiasPrevias.length === 0) return 0;
    const tuvoMismaAsignatura = ayudantiasPrevias.some((ayudantia) => ayudantia.asignatura?.id === asignaturaId);
    if (tuvoMismaAsignatura) return 3;
    return 1;
  }

  private calcularEvaluacionAyudantias(ayudantiasPrevias: Ayudantia[], correoProfe?: string): number {
    const recomendado = Boolean(correoProfe);
    if (!recomendado) return 0;
    if (!ayudantiasPrevias || ayudantiasPrevias.length === 0) return 0;

    const ultimaEvaluacion = this.obtenerUltimaEvaluacion(ayudantiasPrevias);
    if (ultimaEvaluacion === null) return 0;
    if (ultimaEvaluacion >= 5) return 3;
    if (ultimaEvaluacion >= 4) return 2;
    if (ultimaEvaluacion > 3) return 1;
    return 0;
  }

  private obtenerUltimaEvaluacion(ayudantiasPrevias: Ayudantia[]): number | null {
    const registroConEvaluacion = ayudantiasPrevias.find((ayudantia) => ayudantia.evaluacion !== null && ayudantia.evaluacion !== undefined);
    return registroConEvaluacion?.evaluacion ?? null;
  }

  private calcularAtrasoSemestres(
    alumno: Alumno | null | undefined,
    asignatura: Asignatura | null,
    asignaturasAlumnoList: AsignaturaAlumno[],
  ): number {
    if (!alumno || !asignatura) return 2;

    // Usamos solo las repeticiones (oportunidad - 1) de todas las asignaturas para estimar el atraso.
    // No usamos nivel - semestre porque no sabemos cuándo cursó cada asignatura.
    const atrasos = asignaturasAlumnoList.map((aa) => {
      const repeticiones = Math.max(0, (aa.oportunidad ?? 1) - 1);
      return repeticiones;
    });

    if (atrasos.length === 0) return 0;

    // El peor caso (máxima repetición) determina el nivel de atraso general
    const peorAtraso = Math.max(...atrasos);
    return peorAtraso;
  }

  private clampConMinimo(valor: number, min: number, max: number): number {
    if (Number.isNaN(valor)) return 0;
    return Math.min(max, Math.max(min, valor));
  }
}
