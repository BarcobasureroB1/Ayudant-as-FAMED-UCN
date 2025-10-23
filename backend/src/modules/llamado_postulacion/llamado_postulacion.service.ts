import { Injectable } from '@nestjs/common';
import { CreateLlamadoPostulacionDto } from './dto/create-llamado_postulacion.dto';
import { UpdateLlamadoPostulacionDto } from './dto/update-llamado_postulacion.dto';

@Injectable()
export class LlamadoPostulacionService {
  create(createLlamadoPostulacionDto: CreateLlamadoPostulacionDto) {
    return 'This action adds a new llamadoPostulacion';
  }

  findAll() {
    return `This action returns all llamadoPostulacion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} llamadoPostulacion`;
  }

  update(id: number, updateLlamadoPostulacionDto: UpdateLlamadoPostulacionDto) {
    return `This action updates a #${id} llamadoPostulacion`;
  }

  remove(id: number) {
    return `This action removes a #${id} llamadoPostulacion`;
  }
}
