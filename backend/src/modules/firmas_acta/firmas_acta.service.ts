import { Injectable } from '@nestjs/common';
import { CreateFirmasActaDto } from './dto/create-firmas_acta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FirmasActa } from './entities/firmas_acta.entity';
import { Repository } from 'typeorm';


@Injectable()
export class FirmasActaService {
  constructor(
    @InjectRepository(FirmasActa)
    private readonly firmasActaRepository: Repository<FirmasActa>,  
  ) {}
  create(createFirmasActaDto: CreateFirmasActaDto) {
    const firmasActa = this.firmasActaRepository.create(createFirmasActaDto);
    return this.firmasActaRepository.save(firmasActa);
  }

  findAll() {
    return `This action returns all firmasActa`;
  }

  findOne(id: number) {
    return `This action returns a #${id} firmasActa`;
  }

  update(id: number) {
    return `This action updates a #${id} firmasActa`;
  }

  remove(id: number) {
    return `This action removes a #${id} firmasActa`;
  }
}
