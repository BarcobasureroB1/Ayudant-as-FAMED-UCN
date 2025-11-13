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
    // ensure usuario.coordinador array exists before pushing
    if (!user_coordinador.coordinador) {
      user_coordinador.coordinador = [];
    }
    user_coordinador.coordinador.push(coordinador);
    await this.usuarioRepository.save(user_coordinador);
    // ensure asignatura.coordinador array exists before pushing
    if (!asignatura.coordinador) {
      asignatura.coordinador = [];
    }
    asignatura.coordinador.push(coordinador);
    await this.asignaturaRepository.save(asignatura);

    return this.coordinadorRepository.save(coordinador);
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
}
