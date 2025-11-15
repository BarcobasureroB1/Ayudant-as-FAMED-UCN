import { Injectable } from '@nestjs/common';


import { CreateLlamadoPostulacionDto } from './dto/create-llamado-postulacion.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LlamadoPostulacion } from './entities/llamado_postulacion.entity';
import { Repository } from 'typeorm';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class LlamadoPostulacionService {

  constructor(@InjectRepository(LlamadoPostulacion)
  private readonly llamadoPostulacionRepository: Repository<LlamadoPostulacion>,
  @InjectRepository(Usuario)
  private readonly usuarioRepository: Repository<Usuario>,
  @InjectRepository(Asignatura)
  private readonly asignaturaRepository: Repository<Asignatura>,
) {}
  async create(createLlamadoPostulacionDto: CreateLlamadoPostulacionDto) {

    const rutSecretaria = String(createLlamadoPostulacionDto.rut_secretaria);
    const secretaria = await this.usuarioRepository.findOneBy({ rut: rutSecretaria });
    if (!secretaria) {  
      throw new Error('Secretaria no encontrada');
    }
    const asignatura = await this.asignaturaRepository.findOneBy({ id: createLlamadoPostulacionDto.id_asignatura }); 
    if (!asignatura) {
      throw new Error('Asignatura no encontrada');
    }

    // build payload without the raw rut_secretaria field (we'll set the relation)
    const payload: any = { ...createLlamadoPostulacionDto };
    delete payload.rut_secretaria;

    const entity = this.llamadoPostulacionRepository.create({
      ...payload,
      asignatura,
      secretaria,
    });

    return await this.llamadoPostulacionRepository.save(entity);
  }

  async findAll() {
    return await this.llamadoPostulacionRepository.find();
  }

  async findbyAsignatura(id_asignatura: number) {
    return await this.llamadoPostulacionRepository.find({
      where: { asignatura: { id: id_asignatura }, estado: 'abierto' },
    });

  }

  async cambiarEstado(id: number) {
    const entity = await this.llamadoPostulacionRepository.findOneBy({ id });
    if (!entity) {
      throw new Error('Llamado no encontrado');
    }
    entity.estado = 'cerrado';
    return await this.llamadoPostulacionRepository.save(entity);
  }

 

  
}
