import { IsNumber, IsString } from 'class-validator';

export class CreateUsuarioDto {
    @IsString()
    rut: string;
    @IsString()
    nombres: string;
    @IsString()
    apellidos: string;
    @IsString()
    password: string;
    @IsString()
    tipo: string;
    @IsNumber()
    c_ayudantia: number;
    @IsString()
    correo: string;
}
