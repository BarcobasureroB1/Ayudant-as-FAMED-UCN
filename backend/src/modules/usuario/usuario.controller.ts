import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';


@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  findAll() {
    return this.usuarioService.findAll();
  }

  @Get(':rut')
  findOne(@Param('rut') rut: string) {
    return this.usuarioService.findOne(rut);
  }


  @Get('alumno/:rut_alumno')
  findAlumno(@Param('rut_alumno') rut_alumno: string) {
    return this.usuarioService.findnivel(rut_alumno);
  }
  @Post('Registro')
  register(@Body() usuario: Usuario) {
    return this.usuarioService.guardar(usuario);
  }

  @Get('coordinadores/all')
  findCoordinadores() {
    return this.usuarioService.findcoordinadores();
  }

}
