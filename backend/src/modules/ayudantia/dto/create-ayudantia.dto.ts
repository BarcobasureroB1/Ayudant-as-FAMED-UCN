import { IsNumber, IsString } from "class-validator";

export class CreateAyudantiaDto {
    @IsString()
    rut_alumno: string;

    @IsNumber()
    id_asignatura: number;

    @IsNumber()
    evaluacion: number;

    @IsString()
    rut_coordinador_otro: string;

    @IsString()
    periodo: string;

    @IsString()
    remunerada: string;

    @IsString()
    tipo_ayudantia: string;
}
