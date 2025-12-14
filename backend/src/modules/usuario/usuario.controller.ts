import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { Usuario } from './entities/usuario.entity';
import { CambiarTipoDto } from './dto/cambiar-tipo.dto';


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
  @Patch('cambiar-tipo')
  cambiarTipo(@Body() cambiarTipoDto: CambiarTipoDto) {
    const { rut_usuario, nuevo_tipo } = cambiarTipoDto;
    return this.usuarioService.cambiartipo(rut_usuario, nuevo_tipo);
  }

  @Patch('deshabilitar/:rut')
  deshabilitarUsuario(@Param('rut') rut: string) {
    return this.usuarioService.deshabilitarUsuario(rut);
  }
  @Patch('habilitar/:rut')
  habilitarUsuario(@Param('rut') rut: string) {
    return this.usuarioService.habilitarUsuario(rut);
  }

  @Get('secretaria-docente/endpoint/a')
  getSecretarioDocente() {
    return this.usuarioService.getsecretario_docente();
  }
}
