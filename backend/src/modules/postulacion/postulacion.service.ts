import { Injectable } from '@nestjs/common';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';


@Injectable()
export class PostulacionService {
  create(createPostulacionDto: CreatePostulacionDto) {
    return 'This action adds a new postulacion';
  }

  findAll() {
    return `This action returns all postulacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} postulacion`;
  }

  update(id: number) {
    return `This action updates a #${id} postulacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} postulacion`;
  }
}
