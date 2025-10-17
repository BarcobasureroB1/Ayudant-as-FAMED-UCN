import { Injectable } from '@nestjs/common';
import { CreateAyudantiaDto } from './dto/create-ayudantia.dto';


@Injectable()
export class AyudantiaService {
  create(createAyudantiaDto: CreateAyudantiaDto) {
    return 'This action adds a new ayudantia';
  }

  findAll() {
    return `This action returns all ayudantia`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ayudantia`;
  }

 

  remove(id: number) {
    return `This action removes a #${id} ayudantia`;
  }
}
