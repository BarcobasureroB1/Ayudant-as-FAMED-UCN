import { IsOptional, IsString } from "class-validator";

export class CreateAsignaturaDto {
    @IsString()
    nombre: string;

    @IsString()
    @IsOptional()
    estado?: string;
    @IsString()
    semestre: number;
    @IsString()
    nrc: string;
    @IsString()
    Departamento:string

}
