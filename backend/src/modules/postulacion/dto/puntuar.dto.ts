import { IsNumber } from "class-validator";

export class PuntuarDto {
    @IsNumber()
    puntuacion_etapa2: number;
}