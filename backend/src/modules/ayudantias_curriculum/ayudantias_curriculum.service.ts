import { Injectable } from '@nestjs/common';
import { CreateAyudantiasCurriculumDto } from './dto/create-ayudantias_curriculum.dto';
import { AyudantiasCurriculum } from './entities/ayudantias_curriculum.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class AyudantiasCurriculumService {
  constructor(
    @InjectRepository(AyudantiasCurriculum)
    private readonly ayudantiasCurriculumRepository: Repository<AyudantiasCurriculum>,
  ) {}

  async findByAlumno(rut_alumno: string) {
    const ayudantias = await this.ayudantiasCurriculumRepository.find({
      where: { alumno: { rut_alumno } },
    });
    if (!ayudantias) {
      return null;
    }
    return ayudantias;
  }
}
