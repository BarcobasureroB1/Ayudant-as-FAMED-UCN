import { IsNumber } from "class-validator";

export class evaluarAyudantiaDto {
    @IsNumber()
    evaluacion: number
}