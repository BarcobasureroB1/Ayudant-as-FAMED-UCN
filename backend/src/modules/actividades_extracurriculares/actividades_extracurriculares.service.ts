import { Injectable } from '@nestjs/common';
import { CreateActividadesExtracurriculareDto } from './dto/create-actividades_extracurriculare.dto';


@Injectable()
export class ActividadesExtracurricularesService {
  create(createActividadesExtracurriculareDto: CreateActividadesExtracurriculareDto) {
    return 'This action adds a new actividadesExtracurriculare';
  }

  findAll() {
    return `This action returns all actividadesExtracurriculares`;
  }

  findOne(id: number) {
    return `This action returns a #${id} actividadesExtracurriculare`;
  }

  

  remove(id: number) {
    return `This action removes a #${id} actividadesExtracurriculare`;
  }
}
