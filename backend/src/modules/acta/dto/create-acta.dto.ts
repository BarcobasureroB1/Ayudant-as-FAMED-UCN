import { IsArray, IsDateString, IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { CreateParticipantesActaDto } from 'src/modules/participantes_acta/dto/create-participantes_acta.dto';
import { CreateFirmasActaDto } from 'src/modules/firmas_acta/dto/create-firmas_acta.dto';
import { Type } from 'class-transformer';

export class CreateActaDto {
    @IsNotEmpty()
    @IsString()
    departamento: string;
    @IsNotEmpty()
    @IsNumber()
    id_departamento: number
    @IsNotEmpty()
    @IsString()
    fecha : string;
    @IsNotEmpty()
    @IsString()
    hora_inicio: string
    @IsNotEmpty()
    @IsString()
    hora_fin: string
    @IsNotEmpty()
    @IsString()
    lugar: string
    @IsNotEmpty()
    @IsString()
    rut_secretaria: string;

    @IsArray() @ValidateNested({ each: true }) @Type(() => CreateParticipantesActaDto)
    participantes: CreateParticipantesActaDto[];

    @IsArray() @ValidateNested({ each: true }) @Type(() => CreateFirmasActaDto)
    firmas: CreateFirmasActaDto[];


}
