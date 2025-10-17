import { IsString } from "class-validator";

export class RegisterDto {
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

}