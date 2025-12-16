import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsuarioService } from '../usuario/usuario.service';
import { JwtService } from '@nestjs/jwt';
import { AlumnoService } from '../alumno/alumno.service';
import { EmailService } from '../email/email.service';
import { NotFoundException, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import * as bcryptjs from 'bcryptjs';
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usuarioService: UsuarioService;
  let jwtService: JwtService;
  let alumnoService: AlumnoService;
  let emailService: EmailService;

  const mockUsuario: Usuario = {
    rut: '12345678-9',
    nombres: 'Juan',
    apellidos: 'Pérez',
    correo: 'juan@example.com',
    password: 'hashedPassword123',
    tipo: 'alumno',
    deshabilitado: false,
    c_ayudantias: 0,
    departamentos: [],
    ayudantias: [],
    titulos: [],
    ayudantias_como_alumno: [],
    actividades_cientificas: [],
    actividades_extracurriculares: [],
    ayudantias_como_coordinador: [],
    postulaciones: [],
    coordinador: [],
  };

  const mockAlumno: Alumno = {
    rut_alumno: '12345678-9',
    nombres: 'Juan',
    apellidos: 'Pérez',
    correo: 'juan@example.com',
    fecha_admision: '2023-01-01',
    codigo_carrera: 'INF',
    nombre_carrera: 'Ingeniería',
    promedio: 5.5,
    nivel: 1,
    periodo: '2023-1',
    asignaturasAlumno: [],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsuarioService,
          useValue: {
            findforLogin: jest.fn(),
            guardar: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
        {
          provide: AlumnoService,
          useValue: {
            findByRut: jest.fn(),
          },
        },
        {
          provide: EmailService,
          useValue: {
            send: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usuarioService = module.get<UsuarioService>(UsuarioService);
    jwtService = module.get<JwtService>(JwtService);
    alumnoService = module.get<AlumnoService>(AlumnoService);
    emailService = module.get<EmailService>(EmailService);
  });

  describe('login', () => {
    it('debe retornar access_token y datos del usuario si las credenciales son válidas', async () => {
      const loginDto = { rut: '12345678-9', password: 'password123' };
      const token = 'jwt_token_123';

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(mockUsuario);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(true);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: token,
        user: {
          rut: mockUsuario.rut,
          nombres: mockUsuario.nombres,
          apellidos: mockUsuario.apellidos,
          tipo: mockUsuario.tipo,
        },
      });
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const loginDto = { rut: '99999999-9', password: 'password123' };

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      const loginDto = { rut: '12345678-9', password: 'wrongPassword' };

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(mockUsuario);
      (bcryptjs.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Register', () => {
    it('debe registrar un usuario alumno válido', async () => {
      const registerDto = {
        rut: '12345678-9',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan@example.com',
        password: 'password123',
        tipo: 'alumno',
      };

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(null);
      jest.spyOn(alumnoService, 'findByRut').mockResolvedValue(mockAlumno);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('hashedPassword');
      jest.spyOn(usuarioService, 'guardar').mockResolvedValue(mockUsuario);

      const result = await service.Register(registerDto);

      expect(result).toEqual({ message: 'Usuario registrado exitosamente' });
      expect(usuarioService.guardar).toHaveBeenCalled();
    });

    it('debe lanzar BadRequestException si el RUT es inválido', async () => {
      const registerDto = {
        rut: 'invalid-rut',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan@example.com',
        password: 'password123',
        tipo: 'alumno',
      };

      await expect(service.Register(registerDto)).rejects.toThrow(BadRequestException);
    });

    it('debe lanzar ConflictException si el usuario ya existe', async () => {
      const registerDto = {
        rut: '12345678-9',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan@example.com',
        password: 'password123',
        tipo: 'alumno',
      };

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(mockUsuario);

      await expect(service.Register(registerDto)).rejects.toThrow(ConflictException);
    });

    it('debe lanzar BadRequestException si el tipo es alumno pero no existe en la BD', async () => {
      const registerDto = {
        rut: '12345678-9',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan@example.com',
        password: 'password123',
        tipo: 'alumno',
      };

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(null);
      jest.spyOn(alumnoService, 'findByRut').mockResolvedValue(null);

      await expect(service.Register(registerDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('comprobarrut', () => {
    it('debe retornar true para un RUT válido', () => {
      expect(service.comprobarrut('12345678-9')).toBe(true);
      expect(service.comprobarrut('12345678')).toBe(true);
      expect(service.comprobarrut('12.345.678-9')).toBe(true);
    });

    it('debe retornar false para un RUT inválido', () => {
      expect(service.comprobarrut('')).toBe(false);
      expect(service.comprobarrut('abc')).toBe(false);
    });
  });

  describe('enviarRecuperacionContrasena', () => {
    it('debe enviar un correo de recuperación para un usuario válido', async () => {
      const rut = '12345678-9';
      const token = 'reset_token_123';

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(mockUsuario);
      jest.spyOn(alumnoService, 'findByRut').mockResolvedValue(mockAlumno);
      jest.spyOn(jwtService, 'sign').mockReturnValue(token);
      jest.spyOn(emailService, 'send').mockResolvedValue(undefined);

      const result = await service.enviarRecuperacionContrasena(rut);

      expect(result).toEqual({ message: 'Se ha enviado un correo de recuperación a tu cuenta' });
      expect(emailService.send).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const rut = '99999999-9';

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(null);

      await expect(service.enviarRecuperacionContrasena(rut)).rejects.toThrow(NotFoundException);
    });

    it('debe lanzar BadRequestException si el correo no coincide', async () => {
      const rut = '12345678-9';
      const mockAlumnoConOtroCorreo = { ...mockAlumno, correo: 'otro@example.com' };

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(mockUsuario);
      jest.spyOn(alumnoService, 'findByRut').mockResolvedValue(mockAlumnoConOtroCorreo);

      await expect(service.enviarRecuperacionContrasena(rut)).rejects.toThrow(BadRequestException);
    });
  });

  describe('restablecerContrasena', () => {
    it('debe restablecer la contraseña exitosamente', async () => {
      const rut = '12345678-9';
      const nuevaContrasena = 'newPassword123';

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(mockUsuario);
      (bcryptjs.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      jest.spyOn(usuarioService, 'guardar').mockResolvedValue(mockUsuario);

      const result = await service.restablecerContrasena(rut, nuevaContrasena);

      expect(result).toEqual({ message: 'Contraseña restablecida exitosamente' });
      expect(usuarioService.guardar).toHaveBeenCalled();
    });

    it('debe lanzar NotFoundException si el usuario no existe', async () => {
      const rut = '99999999-9';
      const nuevaContrasena = 'newPassword123';

      jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(null);

      await expect(service.restablecerContrasena(rut, nuevaContrasena)).rejects.toThrow(NotFoundException);
    });
  });
});
