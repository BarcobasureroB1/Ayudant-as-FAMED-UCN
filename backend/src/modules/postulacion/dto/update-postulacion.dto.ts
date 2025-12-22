import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdatePostulacionDto {
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  rut_alumno?: string;

  // id de la asignatura 
  @IsOptional()
  @IsNumber()
  id_asignatura?: number;

  @IsOptional()
  @IsString()
  nombre_asignatura?: string;

  @IsOptional()
  @IsString()
  descripcion_carta?: string;

  @IsOptional()
  @IsString()
  correo_profe?: string;

  @IsOptional()
  @IsString()
  actividad?: string;

  @IsOptional()
  @IsString()
  metodologia?: string;

  @IsOptional()
  @IsString()
  dia?: string;

  @IsOptional()
  @IsString()
  bloque?: string;
}
