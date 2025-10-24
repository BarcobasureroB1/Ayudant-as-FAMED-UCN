import { Injectable } from '@nestjs/common';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postulacion } from './entities/postulacion.entity';
import { Ayudantia } from '../ayudantia/entities/ayudantia.entity';
import { Usuario } from '../usuario/entities/usuario.entity';


@Injectable()
export class PostulacionService {
  constructor(
    
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
    @InjectRepository(Ayudantia)
    private readonly ayudantiaRepository: Repository<Ayudantia>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}
  async create(createPostulacionDto: CreatePostulacionDto) {
    const usuario = await this.usuarioRepository.findOneBy({ rut: createPostulacionDto.rut_alumno });
    if (!usuario) {
      return null;
    }

    const ayudantia = await this.ayudantiaRepository.findOneBy({ id: createPostulacionDto.id_asignatura });
    if (!ayudantia) {
      return null;
    }

    const postulacion = this.postulacionRepository.create({
      ...createPostulacionDto,
      usuario,
      ayudantia,
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
    const usuario = await this.usuarioRepository.findBy({ rut: rut_alumno });
    if (!usuario) {
      return null;
    }
    return this.postulacionRepository
    .createQueryBuilder('postulacion')
    .leftJoin('postulacion.ayudantia', 'ayudantia')
    .select([
      'postulacion.id',
      'ayudantia.asignatura AS nombre_asignatura',
      'postulacion.descripcion_carta',
      'postulacion.correo_profe',
      'postulacion.actividad',
      'postulacion.metodologia',
      'postulacion.dia',
      'postulacion.bloque',
    ])
    .where('postulacion.usuario.rut = :rut', { rut: rut_alumno })
    .andWhere('postulacion.cancelada_por_usuario = false')
    .andWhere('postulacion.rechazada_por_jefatura = false')
    .andWhere('postulacion.es_actual = true')
    .getRawMany();
  }
}
