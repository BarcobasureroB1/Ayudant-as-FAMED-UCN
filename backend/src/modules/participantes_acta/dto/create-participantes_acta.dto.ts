import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateParticipantesActaDto {
    @IsNotEmpty()
    @IsNumber()
    id_acta: number;
    @IsNotEmpty()
    @IsString()
    nombre: string
    @IsNotEmpty()
    @IsString()
    cargo: string;
    @IsNotEmpty()
    @IsString()
    correo: string;
}
