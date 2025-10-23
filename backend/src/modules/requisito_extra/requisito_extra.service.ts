import { Injectable } from '@nestjs/common';
import { CreateRequisitoExtraDto } from './dto/create-requisito_extra.dto';
import { UpdateRequisitoExtraDto } from './dto/update-requisito_extra.dto';

@Injectable()
export class RequisitoExtraService {
  create(createRequisitoExtraDto: CreateRequisitoExtraDto) {
    return 'This action adds a new requisitoExtra';
  }

  findAll() {
    return `This action returns all requisitoExtra`;
  }

  findOne(id: number) {
    return `This action returns a #${id} requisitoExtra`;
  }

  update(id: number, updateRequisitoExtraDto: UpdateRequisitoExtraDto) {
    return `This action updates a #${id} requisitoExtra`;
  }

  remove(id: number) {
    return `This action removes a #${id} requisitoExtra`;
  }
}
