import { Injectable } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { Departamento } from './entities/departamento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';


@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}
  async create(createDepartamentoDto: CreateDepartamentoDto) {
    const departamento = this.departamentoRepository.create(createDepartamentoDto);
    return await this.departamentoRepository.save(departamento);
  }

  async findAll() {
    return await this.departamentoRepository.find();
  }

  async findOne(id: number) {
    return await this.departamentoRepository.findOne({ where: { id } });
  }
  async asignarsecretariario(id: number, rut_secretario: string) {
    const departamento = await this.departamentoRepository.findOne({
      where: { id },
      relations: ['secretarias'], // cargar la relación
    });
    if (!departamento) {
      return null;
    }

    const secretaria = await this.usuarioRepository.findOne({
      where: { rut: rut_secretario },
    });
    if (!secretaria) {
      return null;
    }

    // inicializar array si es necesario
    if (!departamento.secretarias) {
      departamento.secretarias = [];
    }

    departamento.secretarias.push(secretaria);
    return await this.departamentoRepository.save(departamento);
  }
  async findBysecretarioRut(rut_secretario: string): Promise<{ id: number; nombre: string }[]> {
    const results = await this.departamentoRepository
      .createQueryBuilder('departamento')
      .select(['departamento.id', 'departamento.nombre'])
      .innerJoin('departamento.secretarias', 'usuario')
      .where('usuario.rut = :rut', { rut: rut_secretario })
      .getMany();

    return results.map(d => ({ id: d.id, nombre: d.nombre }));
  }

}
