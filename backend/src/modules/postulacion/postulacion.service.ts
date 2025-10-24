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
    ])
    .where('usuario.rut = :rut', { rut: rut_alumno })
    .andWhere('postulacion.cancelada_por_usuario = false')
    .andWhere('postulacion.rechazada_por_jefatura = false')
    .andWhere('postulacion.es_actual = true')
    .getRawMany();
}
}
