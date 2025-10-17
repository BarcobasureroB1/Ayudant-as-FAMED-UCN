import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcryptjs from 'bcryptjs';
import { RegisterDto } from './dto/RegisterDto';
import { Usuario } from '../usuario/entities/usuario.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService) {}

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
    const usuarioExists = await this.usuarioService.findforLogin(registerDto.rut);
    if (usuarioExists) {
      throw new Error('El usuario ya existe');
    }

    const hashedPassword = await bcryptjs.hash(registerDto.password, 10);
    const newUser = new Usuario()
    newUser.rut = registerDto.rut;
    newUser.nombres = registerDto.nombres;
    newUser.apellidos = registerDto.apellidos;
    newUser.tipo = registerDto.tipo;
    newUser.password = hashedPassword;
    await this.usuarioService.guardar(newUser);

    return { message: 'Usuario registrado exitosamente' };


  }

}