import { Injectable } from '@nestjs/common';
import { CreateConsanguineoDto } from './dto/create-consanguineo.dto';


@Injectable()
export class ConsanguineoService {
  create(createConsanguineoDto: CreateConsanguineoDto) {
    return 'This action adds a new consanguineo';
  }

  findAll() {
    return `This action returns all consanguineo`;
  }

  findOne(id: number) {
    return `This action returns a #${id} consanguineo`;
  }



  remove(id: number) {
    return `This action removes a #${id} consanguineo`;
  }
}
