import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateFirmasActaDto {
    @IsNotEmpty()
    @IsNumber()
    id_acta: number;
    @IsNotEmpty()
    @IsString()
    nombre: string;
    @IsNotEmpty()
    @IsString()
    cargo: string;
}
