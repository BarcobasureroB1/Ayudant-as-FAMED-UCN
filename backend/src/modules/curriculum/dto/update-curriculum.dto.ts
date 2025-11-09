import { IsString, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateCurriculumDto } from './create-curriculum.dto';

class AyudantiaDto {
  @IsString() nombre_asig: string;
  @IsString() nombre_coordinador: string;
  @IsString() evaluacion_obtenida: string;
}

class CursoTituloGradoDto {
  @IsString() nombre_asig: string;
  @IsString() n_coordinador: string;
  @IsString() evaluacion: string;
}

class ActividadCientificaDto {
  @IsString() nombre: string;
  @IsString() descripcion: string;
  @IsString() periodo_participacion: string;
}

class ActividadExtracurricularDto {
  @IsString() nombre: string;
  @IsString() docente: string;
  @IsString() descripcion: string;
  @IsString() periodo_participacion: string;
}

export class UpdateCurriculumDto {
  @IsNumber() id: number;
  @IsOptional() @IsString() rut_alumno?: string;
  @IsOptional() @IsString() nombres?: string;
  @IsOptional() @IsString() apellidos?: string;
  @IsOptional() @IsString() fecha_nacimiento?: string;
  @IsOptional() @IsString() comuna?: string;
  @IsOptional() @IsString() ciudad?: string;
  @IsOptional() @IsString() num_celular?: string;
  @IsOptional() @IsString() correo?: string;
  @IsOptional() @IsString() carrera?: string;
  @IsOptional() @IsString() otros?: string;

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AyudantiaDto)
  ayudantias?: AyudantiaDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CursoTituloGradoDto)
  cursos_titulos_grados?: CursoTituloGradoDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ActividadCientificaDto)
  actividades_cientificas?: ActividadCientificaDto[];

  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ActividadExtracurricularDto)
  actividades_extracurriculares?: ActividadExtracurricularDto[];
}
