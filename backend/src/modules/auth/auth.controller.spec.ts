import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/aurh.guard';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    Register: jest.fn(),
    enviarRecuperacionContrasena: jest.fn(),
    restablecerContrasena: jest.fn(),
  };

  const mockAuthGuard = {
    canActivate: jest.fn().mockResolvedValue(true),
  };

  const mockJwtService = {
    verifyAsync: jest.fn().mockResolvedValue({ rut: '123' }),
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: AuthGuard,
          useValue: mockAuthGuard,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('debe llamar al servicio de login y retornar el resultado', async () => {
      const loginDto = { rut: '12345678-9', password: 'password123' };
      const expectedResult = {
        access_token: 'jwt_token',
        user: {
          rut: '12345678-9',
          nombres: 'Juan',
          apellidos: 'Pérez',
          tipo: 'alumno',
        },
      };

      jest.spyOn(service, 'login').mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('register', () => {
    it('debe llamar al servicio de registro y retornar el resultado', async () => {
      const registerDto = {
        rut: '12345678-9',
        nombres: 'Juan',
        apellidos: 'Pérez',
        correo: 'juan@example.com',
        password: 'password123',
        tipo: 'alumno',
      };
      const expectedResult = { message: 'Usuario registrado exitosamente' };

      jest.spyOn(service, 'Register').mockResolvedValue(expectedResult);

      const result = await controller.register(registerDto);

      expect(service.Register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('profile', () => {
    it('debe retornar los datos del usuario del request', () => {
      const mockUser = {
        rut: '12345678-9',
        nombres: 'Juan',
        apellidos: 'Pérez',
        tipo: 'alumno',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = controller.profile(mockRequest);

      expect(result).toEqual(mockUser);
    });
  });

  describe('recuperarContrasena', () => {
    it('debe llamar al servicio de recuperación de contraseña', async () => {
      const body = { rut: '12345678-9' };
      const expectedResult = { message: 'Se ha enviado un correo de recuperación a tu cuenta' };

      jest.spyOn(service, 'enviarRecuperacionContrasena').mockResolvedValue(expectedResult);

      const result = await controller.recuperarContrasena(body);

      expect(service.enviarRecuperacionContrasena).toHaveBeenCalledWith(body.rut);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('restablecerContrasena', () => {
    it('debe llamar al servicio de restablecimiento y retornar el resultado', async () => {
      const body = { token: 'reset_token', nuevaContrasena: 'newPassword123' };
      const mockRequest = {
        resetUser: {
          rut: '12345678-9',
        },
      };
      const expectedResult = { message: 'Contraseña restablecida exitosamente' };

      jest.spyOn(service, 'restablecerContrasena').mockResolvedValue(expectedResult);

      const result = await controller.restablecerContrasena(body, mockRequest);

      expect(service.restablecerContrasena).toHaveBeenCalledWith('12345678-9', 'newPassword123');
      expect(result).toEqual(expectedResult);
    });
  });
});
