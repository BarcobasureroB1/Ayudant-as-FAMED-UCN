import { Injectable } from '@nestjs/common';
import { CreateActaDto } from './dto/create-acta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Acta } from './entities/acta.entity';
import { Departamento } from '../departamento/entities/departamento.entity';
import { Repository } from 'typeorm';
import { FirmasActa } from '../firmas_acta/entities/firmas_acta.entity';
import { ParticipantesActa } from '../participantes_acta/entities/participantes_acta.entity';


@Injectable()
export class ActaService {
  constructor(
    @InjectRepository(Acta)
    private readonly actaRepository: Repository<Acta>,  
    @InjectRepository(Departamento)
    private readonly departamentoRepository: Repository<Departamento>,
  ) {}
  async create(createActaDto: CreateActaDto) {
    const departamentobyid = await   this.departamentoRepository.findOneBy({ id: createActaDto.id_departamento });
    if (!departamentobyid) {
      throw new Error('Departamento no encontrado');
    }
    
    return await this.actaRepository.manager.transaction(async (transactionalEntityManager) => {
      const firmasactarepo = transactionalEntityManager.getRepository(FirmasActa);
      const participantesactarepo = transactionalEntityManager.getRepository(ParticipantesActa);

      const acta = this.actaRepository.create({
        departamento: createActaDto.departamento,
        fecha: createActaDto.fecha,
        lugar: createActaDto.lugar,
        hora_inicio: createActaDto.hora_inicio,
        hora_fin: createActaDto.hora_fin,
        id_departamento: departamentobyid,
        rut_secretaria: createActaDto.rut_secretaria,
        
      });
      const savedActaEntity = await transactionalEntityManager.save(acta);
      
      // Crear y guardar las firmas asociadas en batch
      if (createActaDto.firmas && createActaDto.firmas.length > 0) {
        const firmas = createActaDto.firmas.map((firmaDto) =>
          firmasactarepo.create({
            ...firmaDto,
            acta: savedActaEntity,
          })
        );
        await firmasactarepo.insert(firmas);
      }
      
      // Crear y guardar los participantes asociados en batch
      if (createActaDto.participantes && createActaDto.participantes.length > 0) {
        const participantes = createActaDto.participantes.map((participanteDto) =>
          participantesactarepo.create({
            ...participanteDto,
            acta: savedActaEntity,
          })
        );
        await participantesactarepo.insert(participantes);
      }
      
      return savedActaEntity;
        
      });
      
    ;
    
  }

  async findAll() {
    return this.actaRepository.find({
      relations: ['firmas', 'participantes'],
      order: { id: 'DESC' },
    });
  }

  findOne(id: number) {
    return `This action returns a #${id} acta`;
  }

  findbysecretaria(rut_secretaria: string) {
    return this.actaRepository.find({
      where: { rut_secretaria },
      relations: ['firmas', 'participantes'],
      order: { id: 'DESC' },
    });
  }
  update(id: number) {
    return `This action updates a #${id} acta`;
  }

  remove(id: number) {
    return `This action removes a #${id} acta`;
  }
}
