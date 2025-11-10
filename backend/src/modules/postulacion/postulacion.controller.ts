import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PostulacionService } from './postulacion.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';


@Controller('postulacion')
export class PostulacionController {
  constructor(private readonly postulacionService: PostulacionService) {}

  @Post()
  create(@Body() createPostulacionDto: CreatePostulacionDto) {
    return this.postulacionService.create(createPostulacionDto);
  }
  // Mover la ruta de cancelación a un path explícito para evitar colisiones
  // con la ruta de actualización que antes estaba en 'postulacion'.
  @Patch('cancel/:id')
  cancel(@Param('id') id: string) {
    return this.postulacionService.cancel(+id);
  }
  @Get(':rut_alumno')
  findOne(@Param('rut_alumno') rut_alumno: string) {
    return this.postulacionService.findcurrent(rut_alumno);
  }
  // Actualización parcial: aceptamos el DTO directamente en el body.
  @Patch()
  update(@Body() updatePostulacionDto: UpdatePostulacionDto) {
    return this.postulacionService.update(updatePostulacionDto);
  }

}
