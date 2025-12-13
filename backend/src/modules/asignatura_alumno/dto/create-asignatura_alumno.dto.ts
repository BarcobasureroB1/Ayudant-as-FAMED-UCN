import { IsNumber, IsString } from "class-validator";

export class CreateAsignaturaAlumnoDto {

    @IsString()
    rut_alumno: string;
    @IsString()
    nombre_asignatura: string;
    @IsNumber()
    nota: number;
    @IsNumber()
    oportunidad: number;
}
