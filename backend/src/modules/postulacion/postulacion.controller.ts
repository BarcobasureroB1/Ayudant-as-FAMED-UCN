import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostulacionService } from './postulacion.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';
import { PuntuarDto } from './dto/puntuar.dto';


@Controller('postulacion')
export class PostulacionController {
  constructor(private readonly postulacionService: PostulacionService) {}

  @Post()
  create(@Body() createPostulacionDto: CreatePostulacionDto) {
    return this.postulacionService.create(createPostulacionDto);
  }

  @Patch('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.postulacionService.cancel(+id);
  }
  @Get(':rut_alumno')
  findOne(@Param('rut_alumno') rut_alumno: string) {
    return this.postulacionService.findcurrent(rut_alumno);
  }
  
  @Patch()
  update(@Body() updatePostulacionDto: UpdatePostulacionDto) {
    return this.postulacionService.update(updatePostulacionDto);
  }

  @Get()
  findAll() {
    return this.postulacionService.findAllCurrent();
  }

  @Get('coordinador/:rut_coordinador')
  findByCoordinador(@Param('rut_coordinador') rut_coordinador: string) {
    return this.postulacionService.findPostulacionesByCoordinadorRut(rut_coordinador);
  }
  @Patch('puntuacionetapa2/:id')
  puntuacionetapa2(@Param('id') id: string, @Body() puntuacion_etapa2: PuntuarDto) {
    const puntuacion = puntuacion_etapa2.puntuacion_etapa2;
    return this.postulacionService.puntuacionetapa2(+id, puntuacion);
  }
  @Patch('descartar-postulacion/:id_postulacion')
  descartarPostulacion(@Param('id_postulacion') id_postulacion: string, @Body() dto: DescartarDto) {
    return this.postulacionService.rechazarPorJefatura(+id_postulacion, dto);
  }



}
