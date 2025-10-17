import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParticipantesActaService } from './participantes_acta.service';
import { CreateParticipantesActaDto } from './dto/create-participantes_acta.dto';


@Controller('participantes-acta')
export class ParticipantesActaController {
  constructor(private readonly participantesActaService: ParticipantesActaService) {}

  @Post()
  create(@Body() createParticipantesActaDto: CreateParticipantesActaDto) {
    return this.participantesActaService.create(createParticipantesActaDto);
  }

  @Get()
  findAll() {
    return this.participantesActaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participantesActaService.findOne(+id);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participantesActaService.remove(+id);
  }
}
