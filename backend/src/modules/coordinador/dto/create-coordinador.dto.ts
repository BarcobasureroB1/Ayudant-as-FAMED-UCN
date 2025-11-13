import { IsNumber, IsString } from "class-validator";

export class CreateCoordinadorDto {


    @IsString()
    rut_coordinador: string;
    @IsNumber()
    id_asignatura: number;
    
}

