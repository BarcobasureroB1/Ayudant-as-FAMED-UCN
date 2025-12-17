import { Injectable, NotFoundException, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuarioService } from '../usuario/usuario.service';
import * as bcryptjs from 'bcryptjs';
import { RegisterDto } from './dto/RegisterDto';
import { Usuario } from '../usuario/entities/usuario.entity';
import { AlumnoService } from '../alumno/alumno.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuarioService: UsuarioService,
    private readonly jwtService: JwtService,
    private readonly alumnoService: AlumnoService,
    private readonly emailService: EmailService,
  ) {}

 async login(loginDto: any) {
  const usuario = await this.usuarioService.findforLogin(loginDto.rut);
   if (!usuario) {
     throw new NotFoundException('Usuario no encontrado');
   }
   const passwordIsValid = await bcryptjs.compare(loginDto.password, usuario.password);
   if (!passwordIsValid) {
     throw new UnauthorizedException('Credenciales inválidas: contraseña incorrecta');
   }
   const payload = { rut: usuario.rut, nombres: usuario.nombres, apellidos: usuario.apellidos, tipo : usuario.tipo, deshabilitado: usuario.deshabilitado };
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
      throw new BadRequestException('RUT inválido');
    }
    const usuarioExists = await this.usuarioService.findforLogin(registerDto.rut);
    if (usuarioExists) {
      throw new ConflictException('El usuario ya existe');
    }
    
    const hashedPassword = await bcryptjs.hash(registerDto.password, 10);
    const newUser = new Usuario()
    newUser.rut = registerDto.rut;
    newUser.nombres = registerDto.nombres;
    newUser.apellidos = registerDto.apellidos;
    newUser.correo = registerDto.correo;
    const alumnoExists = await this.alumnoService.findByRut(registerDto.rut);
    
    if (!alumnoExists && registerDto.tipo === 'alumno') {
      newUser.tipo = registerDto.tipo;
      throw new BadRequestException('El usuario no tiene data de alumno registrado');
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

  async enviarRecuperacionContrasena(rut: string) {
    const usuario = await this.usuarioService.findforLogin(rut);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Generar token de recuperación válido por 1 hora
    const resetToken = this.jwtService.sign(
      { rut: usuario.rut },
      { expiresIn: '1h' }
    );

   
    
    const correo = usuario.correo;
    
    
    if (!correo) {
      throw new NotFoundException('No se encontró correo para este usuario');
    }

    const enlaceRecuperacion = `${process.env.FRONTEND_URL || 'http://localhost:8080'}/reset-password?token=${resetToken}`;

    const html = `
      <p>Estimado/a ${usuario.nombres} ${usuario.apellidos},</p>
      <p>Hemos recibido una solicitud para recuperar tu contraseña. Haz clic en el siguiente enlace para restablecerla:</p>
      <p><a href="${enlaceRecuperacion}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Recuperar Contraseña</a></p>
      <p>Este enlace será válido por 1 hora.</p>
      <p>Si no solicitaste esto, ignora este correo.</p>
      <p>Saludos,<br>Sistema de Ayudantías FAMED-UCN</p>
    `;

    await this.emailService.send({
      to: correo,
      subject: 'Recuperación de Contraseña - Sistema de Ayudantías FAMED-UCN',
      html,
    });

    return { message: 'Se ha enviado un correo de recuperación a tu cuenta' };
  }

  async restablecerContrasena(rut: string, nuevaContrasena: string) {
    const usuario = await this.usuarioService.findforLogin(rut);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const hashedPassword = await bcryptjs.hash(nuevaContrasena, 10);
    usuario.password = hashedPassword;
    await this.usuarioService.guardar(usuario);

    return { message: 'Contraseña restablecida exitosamente' };
  }
}