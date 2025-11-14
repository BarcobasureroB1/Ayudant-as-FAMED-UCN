import { Injectable } from '@nestjs/common';
import { CreateCoordinadorDto } from './dto/create-coordinador.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Coordinador } from './entities/coordinador.entity';
import { Repository } from 'typeorm';
import { Departamento } from '../departamento/entities/departamento.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';


@Injectable()
export class CoordinadorService {

  constructor(
    @InjectRepository(Coordinador)
    private readonly coordinadorRepository: Repository<Coordinador>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}
  async create(createCoordinadorDto: CreateCoordinadorDto) {
    const user_coordinador = await this.usuarioRepository.findOneBy({ rut: createCoordinadorDto.rut_coordinador });
    if (!user_coordinador) {
      throw new Error('Usuario no encontrado');
    }
    const asignatura = await this.asignaturaRepository.findOneBy({ id: createCoordinadorDto.id_asignatura });
    if (!asignatura) {
      throw new Error('Asignatura no encontrada');
    }

    
    const coordinador = this.coordinadorRepository.create({
      ...createCoordinadorDto,
      usuario: user_coordinador,
      asignaturas: asignatura,
      
    });
    // Guardar directamente la entidad Coordinador. No hacemos push
    // en `usuario.coordinador` ni en `asignatura.coordinador` para evitar
    // efectos secundarios no deseados al guardar las entidades padre.
    return await this.coordinadorRepository.save(coordinador);
  }

  async actualizarEstadoCoordinador(id_asignatura: number, rut_coordinador: number) {
    const coordinador = await this.coordinadorRepository
      .createQueryBuilder('coordinador')
      .innerJoin('coordinador.usuario', 'usuario')
      .innerJoin('coordinador.asignaturas', 'asignatura')
      .where('usuario.rut = :rut', { rut: rut_coordinador })
      .andWhere('asignatura.id = :id', { id: id_asignatura })
      .andWhere('coordinador.actual = :actual', { actual: true })
      .getOne();

    if (!coordinador) {
      throw new Error('Coordinador no encontrado para la asignatura y rut especificados');
    }

    coordinador.actual = false;
    return this.coordinadorRepository.save(coordinador);
  }

  /**
   * Devuelve todos los coordinadores agrupados por usuario.
   * Cada elemento contiene la información del usuario y un listado
   * de asignaturas que coordina (con el id del registro en coordinador
   * y el flag `actual`).
   */
  async getAll() {
    const rows = await this.coordinadorRepository
      .createQueryBuilder('coord')
      .leftJoin('coord.usuario', 'usuario')
      .leftJoin('coord.asignaturas', 'asignatura')
      .select([
        'coord.id AS coord_id',
        'coord.actual AS coord_actual',
        'usuario.rut AS usuario_rut',
        'usuario.nombres AS usuario_nombres',
        'usuario.apellidos AS usuario_apellidos',
        'asignatura.id AS asignatura_id',
        'asignatura.nombre AS asignatura_nombre',
      ])
      .getRawMany();

    const map = new Map<string, any>();
    for (const r of rows) {
      const rut = r.usuario_rut;
      if (!map.has(rut)) {
        map.set(rut, {
          rut: r.usuario_rut,
          nombres: r.usuario_nombres,
          apellidos: r.usuario_apellidos,
          asignaturas: [],
        });
      }
      const item = map.get(rut);
      if (r.coord_id) {
        item.asignaturas.push({
          coordinadorId: r.coord_id,
          asignatura: r.asignatura_id ? { id: r.asignatura_id, nombre: r.asignatura_nombre } : null,
          actual: Boolean(r.coord_actual),
        });
      }
    }

    return Array.from(map.values());
  }
}
