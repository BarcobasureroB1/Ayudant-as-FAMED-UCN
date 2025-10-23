import { PartialType } from '@nestjs/mapped-types';
import { CreateLlamadoPostulacionDto } from './create-llamado_postulacion.dto';

export class UpdateLlamadoPostulacionDto extends PartialType(CreateLlamadoPostulacionDto) {}
