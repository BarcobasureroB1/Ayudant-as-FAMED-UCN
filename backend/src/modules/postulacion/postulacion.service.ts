import { Injectable } from '@nestjs/common';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postulacion } from './entities/postulacion.entity';
import { Ayudantia } from '../ayudantia/entities/ayudantia.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';


@Injectable()
export class PostulacionService {
  constructor(
    
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
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
}
