import { Injectable } from '@nestjs/common';
import { CreateActividadesExtracurriculareDto } from './dto/create-actividades_extracurriculare.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActividadesExtracurriculare } from './entities/actividades_extracurriculare.entity';


@Injectable()
export class ActividadesExtracurricularesService {
  constructor(
    @InjectRepository(ActividadesExtracurriculare)
    private readonly actividadesExtracurriculareRepository: Repository<ActividadesExtracurriculare>,
  ) {}
  
  async findByAlumno(rut_alumno: string) {
    const actividades = await this.actividadesExtracurriculareRepository.find({
      where: { alumno: { rut_alumno  } },
    });
    if (!actividades) {
     return null
    }
    return actividades;
  }
}
