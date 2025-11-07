import { IsEmail, IsNumber, IsString } from "class-validator";

export class CreateAlumnoDto {
    @IsString()
    rut_alumno: string;
    @IsString()
    nombres:  string;
    @IsString()
    apellidos: string;
    @IsEmail()
    correo: string;
    @IsString()
    fecha_admision: string;
    @IsString()
    codigo_carrera: string;
    @IsString()
    nombre_carrera: string;
    @IsNumber()
    promedio: number;
    @IsNumber()
    nivel: number;
    @IsString()
    periodo: string;
}
