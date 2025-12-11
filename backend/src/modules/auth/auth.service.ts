import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcryptjs from 'bcryptjs';
import { RegisterDto } from './dto/RegisterDto';
import { Usuario } from '../usuario/entities/usuario.entity';
import { AlumnoService } from '../alumno/alumno.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly alumnoService: AlumnoService,
  ) {}

 async login(loginDto: any) {
  const usuario = await this.usuarioService.findforLogin(loginDto.rut);
   if (!usuario) {
     throw new Error('Usuario no encontrado');
   }
   const passwordIsValid = await bcryptjs.compare(loginDto.password, usuario.password);
   if (!passwordIsValid) {
     throw new Error('Contraseña incorrecta');
   }
   const payload = { rut: usuario.rut, nombres: usuario.nombres, apellidos: usuario.apellidos, tipo : usuario.tipo };
   const access_token = this.jwtService.sign(payload);
   return {
     access_token,
     user: {
       rut: usuario.rut,
       nombres: usuario.nombres,
       apellidos: usuario.apellidos,
       tipo: usuario.tipo
     },
    };
  }

  async Register(registerDto: RegisterDto) {
    if (!this.comprobarrut(registerDto.rut)) {
      throw new Error('RUT inválido');
    }
    const usuarioExists = await this.usuarioService.findforLogin(registerDto.rut);
    if (usuarioExists) {
      throw new Error('El usuario ya existe');
    }
    
    const hashedPassword = await bcryptjs.hash(registerDto.password, 10);
    const newUser = new Usuario()
    newUser.rut = registerDto.rut;
    newUser.nombres = registerDto.nombres;
    newUser.apellidos = registerDto.apellidos;
    const alumnoExists = await this.alumnoService.findByRut(registerDto.rut);
    if (!alumnoExists) {
      newUser.tipo = registerDto.tipo;
      throw new Error('El usuario no tiene data de alumno registrado');
    }
    else {
      newUser.tipo = registerDto.tipo;
      console.log('alumno encontrado asignado tipo:', newUser.tipo);
    }
    newUser.password = hashedPassword;
    newUser.c_ayudantias = 0;
    newUser.deshabilitado = false;
    await this.usuarioService.guardar(newUser);

    return { message: 'Usuario registrado exitosamente' };

  }

  comprobarrut(rut: string): boolean {
    if (!rut) return false;
    // remove non-digit characters (dots, dashes, spaces, etc.)
    const cleaned = rut.replace(/[^\d]/g, '');
    if (cleaned.length === 0) return false;
    const parsed = parseInt(cleaned, 10);
    return !Number.isNaN(parsed);
  }
}