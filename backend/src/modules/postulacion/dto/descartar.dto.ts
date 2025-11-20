import { IsBoolean, IsString } from "class-validator";

export class DescartarDto {
    @IsString()
    motivo_descarte: string;
    @IsString()
    fecha_descarte: string;
    @IsBoolean()
    rechazada_por_jefatura: boolean;

}