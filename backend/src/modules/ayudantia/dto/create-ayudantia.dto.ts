import { IsString } from "class-validator";

export class CreateAyudantiaDto {
    @IsString()
    rut_alumno:string
    @IsString()
    id_asignatura:number
    @IsString()
    evaluacion:string
    @IsString()
    rut_coordinador_otro:string
    @IsString()
    periodo:string
    @IsString()
    remunerada:string


}
