
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AyudantiaDto {
  @IsString() nombreAsig: string;
  @IsString() coordinador: string;
  @IsString() evaluacion: string;
}

class CursoTituloGradoDto {
  @IsString() nombre: string;
  @IsString() institucion: string;
  @IsString() fecha: string;
}

class ActividadCientificaDto {
  @IsString() nombre: string;
  @IsString() descripcion: string;
  @IsString() periodoParticipacion: string;
}

class ActividadExtracurricularDto {
  @IsString() nombre: string;
  @IsString() docenteInstitucion: string;
  @IsString() descripcion: string;
  @IsString() periodoParticipacion: string;
}

export class CreateCurriculumDto {
  @IsString() rut_alumno: string;
  @IsString() nombres: string;
  @IsString() apellidos: string;
  @IsString() fecha_nacimiento: string;
  @IsString() comuna: string;
  @IsString() ciudad: string;
  @IsString() num_celular: string;
  @IsString() correo: string;
  @IsString() carrera: string;
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
