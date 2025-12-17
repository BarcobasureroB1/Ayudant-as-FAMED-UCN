import { Injectable } from '@nestjs/common';
import { CreateAyudantiaDto } from './dto/create-ayudantia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ayudantia } from './entities/ayudantia.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';

import { evaluarAyudantiaDto } from './dto/evaluar.dto';
import { EmailService } from '../email/email.service';


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
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    private readonly emailService: EmailService,
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
    const ayudantiaGuardada = await this.ayudantiaRepository.save(entity);

    // Enviar correo al postulante informando que ha sido seleccionado
    const alumnoData = await this.alumnoRepository.findOneBy({ rut_alumno: dto.rut_alumno });
    if (alumnoData && alumnoData.correo) {
      const asunto = `¡Felicitaciones! Has sido seleccionado/a para la ayudantía de ${asignatura.nombre}`;
      const html = `
        <p>Estimado/a ${alumno.nombres} ${alumno.apellidos},</p>
        <p>¡Felicitaciones! Te complacemos informar que has sido seleccionado/a para desempeñarte como ayudante en la asignatura de <strong>${asignatura.nombre}</strong>.</p>
        <p><strong>Período:</strong> ${dto.periodo}</p>
        <p><strong>Tipo de ayudantía:</strong> ${dto.tipo_ayudantia}</p>
        <p><strong>Remunerada:</strong> ${dto.remunerada ? 'Sí' : 'No'}</p>
        <p>Te recomendamos que te pongas en contacto con la coordinación para conocer los detalles de tu trabajo.</p>
        <p>Saludos,<br>Sistema de Ayudantías FAMED-UCN</p>
      `;
      await this.emailService.send({
        to: alumnoData.correo,
        subject: asunto,
        html,
      });
    }

    return ayudantiaGuardada;
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
    const asignaturaIds = await this.getAsignaturaIdsForCoordinador(rut);
    if (asignaturaIds.length === 0) return [];
    
    const raws = await this.getAyudantiasByAsignaturasAndCoordinador(asignaturaIds, rut);
    
    return this.mapAyudantias(raws);
  }

  // Obtiene IDs de asignaturas donde el coordinador (por rut) es actual
  private async getAsignaturaIdsForCoordinador(rutCoordinador: string): Promise<number[]> {
    const rows = await this.coordinadorRepository
      .createQueryBuilder('c')
      .innerJoin('c.usuario', 'usuario')
      .innerJoin('c.asignaturas', 'asignatura')
      .where('usuario.rut = :rut', { rut: rutCoordinador })
      .andWhere('c.actual = :actual', { actual: true })
      .select(['asignatura.id AS asignatura_id'])
      .getRawMany();
    return Array.from(new Set(rows.map((r) => r.asignatura_id).filter(Boolean)));
  }

  // Obtiene todos los IDs de asignaturas donde cualquier coordinador actual está asignado, con datos del coordinador
  private async getAsignaturaIdsForAllCoordinadores(): Promise<{ asignaturaId: number; coordinador: any }[]> {
    const rows = await this.coordinadorRepository
      .createQueryBuilder('c')
      .innerJoin('c.asignaturas', 'asignatura')
      .innerJoin('c.usuario', 'usuario')
      .where('c.actual = :actual', { actual: true })
      .select([
        'asignatura.id AS asignatura_id',
        'usuario.rut AS coordinador_rut',
        'usuario.nombres AS coordinador_nombres',
        'usuario.apellidos AS coordinador_apellidos',
      ])
      .getRawMany();
    return rows.map((r) => ({
      asignaturaId: r.asignatura_id,
      coordinador: {
        rut: r.coordinador_rut,
        nombres: r.coordinador_nombres,
        apellidos: r.coordinador_apellidos,
      },
    }));
  }

  // Consulta ayudantías por lista de asignaturas
  private async getAyudantiasByAsignaturas(asignaturaIds: number[]) {
    return await this.ayudantiaRepository
      .createQueryBuilder('ayudantia')
      .leftJoin('ayudantia.alumno', 'alumno')
      .leftJoin(Alumno, 'alumno_data', 'alumno_data.rut_alumno = alumno.rut')
      .leftJoin('ayudantia.asignatura', 'asignatura')
      .leftJoin('asignatura.coordinador', 'coord', 'coord.actual = :actual', { actual: true })
      .leftJoin('coord.usuario', 'coord_usuario')
      .select([
        'ayudantia.id AS id',
        'alumno.rut AS alumno_rut',
        'alumno.nombres AS alumno_nombres',
        'alumno.apellidos AS alumno_apellidos',
        'alumno_data.correo AS alumno_correo',
        'alumno_data.nivel AS alumno_nivel',
        'alumno_data.promedio AS alumno_promedio',
        'alumno_data.nombre_carrera AS alumno_nombre_carrera',
        'asignatura.nombre AS asignatura_nombre',
        'ayudantia.periodo AS periodo',
        'ayudantia.evaluacion AS evaluacion',
        'coord_usuario.rut AS coordinador_rut',
        'coord_usuario.nombres AS coordinador_nombres',
        'coord_usuario.apellidos AS coordinador_apellidos',
      ])
      .where('asignatura.id IN (:...ids)', { ids: asignaturaIds })
      .getRawMany();
  }

  private async getAyudantiasByAsignaturasAndCoordinador(asignaturaIds: number[], rutCoordinador: string) {
    return await this.ayudantiaRepository
      .createQueryBuilder('ayudantia')
      .leftJoin('ayudantia.alumno', 'alumno')
      .leftJoin(Alumno, 'alumno_data', 'alumno_data.rut_alumno = alumno.rut')
      .leftJoin('ayudantia.asignatura', 'asignatura')
      .innerJoin('asignatura.coordinador', 'coord', 'coord.actual = :actual', { actual: true })
      .innerJoin('coord.usuario', 'coord_usuario', 'coord_usuario.rut = :rut', { rut: rutCoordinador })
      .select([
        'ayudantia.id AS id',
        'alumno.rut AS alumno_rut',
        'alumno.nombres AS alumno_nombres',
        'alumno.apellidos AS alumno_apellidos',
        'alumno_data.correo AS alumno_correo',
        'alumno_data.nivel AS alumno_nivel',
        'alumno_data.promedio AS alumno_promedio',
        'alumno_data.nombre_carrera AS alumno_nombre_carrera',
        'asignatura.nombre AS asignatura_nombre',
        'ayudantia.periodo AS periodo',
        'ayudantia.evaluacion AS evaluacion',
        'coord_usuario.rut AS coordinador_rut',
        'coord_usuario.nombres AS coordinador_nombres',
        'coord_usuario.apellidos AS coordinador_apellidos',
      ])
      .where('asignatura.id IN (:...ids)', { ids: asignaturaIds })
      .getRawMany();
  }

  // Mapea crudo a formato público
  private mapAyudantias(rows: any[]) {
    return rows.map((r) => ({
      id: Number(r.id),
      alumno: {
        rut: r.alumno_rut,
        nombres: r.alumno_nombres,
        apellidos: r.alumno_apellidos,
        correo: r.alumno_correo || null,
        nivel: r.alumno_nivel || null,
        promedio: r.alumno_promedio ? Number(r.alumno_promedio) : null,
        nombre_carrera: r.alumno_nombre_carrera || null,
      },
      asignatura: r.asignatura_nombre,
      periodo: r.periodo,
      evaluacion: r.evaluacion !== null && r.evaluacion !== undefined ? Number(r.evaluacion) : null,
      coordinador: r.coordinador_rut ? {
        rut: r.coordinador_rut,
        nombres: r.coordinador_nombres,
        apellidos: r.coordinador_apellidos,
      } : null,
    }));
  }

  // Nuevo: Busca ayudantías para todas las asignaturas coordinadas por coordinadores actuales
  async findAyudantiasByCoordinadores() {
    console.log('Finding ayudantias for all coordinadores');
    const asignaturasConCoord = await this.getAsignaturaIdsForAllCoordinadores();
    if (asignaturasConCoord.length === 0) return [];
    const asignaturaIds = Array.from(new Set(asignaturasConCoord.map((a) => a.asignaturaId)));
    const raws = await this.getAyudantiasByAsignaturas(asignaturaIds);
    return this.mapAyudantias(raws);
  }
  
  async findAll() {
    return this.ayudantiaRepository.find({
      relations: ['alumno', 'asignatura', 'coordinador'],
      order: { id: 'DESC' },
    });
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