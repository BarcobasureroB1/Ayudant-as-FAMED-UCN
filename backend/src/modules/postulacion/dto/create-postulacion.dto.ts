import { IsString } from "class-validator";


export class CreatePostulacionDto {
    @IsString()
    rut_alumno: string;
    @IsString()
    id_asignatura: number;
    @IsString()
    nombre_asignatura: string;
    @IsString()
    descripcion_carta: string;
    @IsString()
    correo_profe: string;
    @IsString()
    actividad: string;
    @IsString()
    metodologia: string;
    @IsString()
    dia: string
    @IsString()
    bloque: string



}
