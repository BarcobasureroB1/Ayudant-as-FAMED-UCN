import { Injectable } from '@nestjs/common';
import { CreateAyudantiasCurriculumDto } from './dto/create-ayudantias_curriculum.dto';


@Injectable()
export class AyudantiasCurriculumService {
  create(createAyudantiasCurriculumDto: CreateAyudantiasCurriculumDto) {
    return 'This action adds a new ayudantiasCurriculum';
  }

  findAll() {
    return `This action returns all ayudantiasCurriculum`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ayudantiasCurriculum`;
  }

  update(id: number) {
    return `This action updates a #${id} ayudantiasCurriculum`;
  }

  remove(id: number) {
    return `This action removes a #${id} ayudantiasCurriculum`;
  }
}
