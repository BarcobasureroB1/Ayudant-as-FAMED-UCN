import { Injectable } from '@nestjs/common';
import { CreateDepartamentoDto } from './dto/create-departamento.dto';
import { Departamento } from './entities/departamento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class DepartamentoService {
  constructor(
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}
  create(createDepartamentoDto: CreateDepartamentoDto) {
    const departamento = this.departamentoRepository.create(createDepartamentoDto);
    return this.departamentoRepository.save(departamento);
  }

  findAll() {
    return this.departamentoRepository.find();
  }

  findOne(id: number) {
    return this.departamentoRepository.findOne({ where: { id } });
  }

  update(id: number) {
    return `This action updates a #${id} departamento`;
  }

  remove(id: number) {
    return `This action removes a #${id} departamento`;
  }
}
