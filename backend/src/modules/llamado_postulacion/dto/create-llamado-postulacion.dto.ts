import { IsNumber, IsString, IsBoolean, IsArray, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLlamadoPostulacionDto {
  @IsNumber()
  id_asignatura: number;

  @IsString()
  semestre: string;

  @IsDate()
  @Type(() => Date)
  entrega_antecedentes: Date;

  @IsDate()
  @Type(() => Date)
  fecha_inicio: Date;

  @IsDate()
  @Type(() => Date)
  fecha_termino: Date;

  @IsString()
  tipo_ayudantia: string;

  @IsString()
  tipo_remuneracion: string;

  @IsNumber()
  horas_mensuales: number;

  @IsBoolean()
  horario_fijo: boolean;

  @IsNumber()
  cant_ayudantes: number;

  @IsString()
  estado: string;

  @IsString()
  rut_secretaria: string;

  @IsArray()
  @IsString({ each: true })
  descripcion: string[];
}
