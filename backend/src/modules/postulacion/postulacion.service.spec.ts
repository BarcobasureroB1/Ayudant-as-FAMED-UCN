import { Test, TestingModule } from '@nestjs/testing';
import { PostulacionService } from './postulacion.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postulacion } from './entities/postulacion.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';
import { Alumno } from '../alumno/entities/alumno.entity';
import { Ayudantia } from '../ayudantia/entities/ayudantia.entity';
import { AsignaturaAlumno } from '../asignatura_alumno/entities/asignatura_alumno.entity';
import { EmailService } from '../email/email.service';
import { DescartarDto } from './dto/descartar.dto';

describe('PostulacionService', () => {
  let service: PostulacionService;
  let postulacionRepository: Repository<Postulacion>;
  let asignaturaRepository: Repository<Asignatura>;
  let usuarioRepository: Repository<Usuario>;
  let alumnoRepository: Repository<Alumno>;
  let emailService: EmailService;

  const mockUsuario: Usuario = {
    rut: '12345678-9',
    nombres: 'Juan',
    apellidos: 'Pérez',
    correo: 'juan@example.com',
    password: 'hashed',
    tipo: 'alumno',
    c_ayudantias: 0,
    deshabilitado: false,
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

  const mockAsignatura: Asignatura = {
    id: 1,
    nombre: 'Matemática',
    estado: 'abierta',
    semestre: 1,
    nrc: '123',
    abierta_postulacion: true,
    departamentos: [],
    asignaturasAlumnos: [],
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
    nivel: 3,
    periodo: '2023-1',
    asignaturasAlumno: [],
  };

  const mockAsignaturaAlumno: AsignaturaAlumno = {
    id: 1,
    nota: 6.0,
    oportunidad: 1,
    asignatura: mockAsignatura,
    alumno: mockAlumno,
  };

  const mockAyudantia: Ayudantia = {
    id: 1,
    alumno: mockUsuario,
    asignatura: mockAsignatura,
    evaluacion: 5,
    coordinador: mockUsuario,
    periodo: '2023-1',
    remunerada: 'si',
    tipo_ayudantia: 'Ayudantia Docente',
  };

  const mockPostulacion: Postulacion = {
    id: 1,
    usuario: mockUsuario,
    asignatura: mockAsignatura,
    descripcion_carta: 'Quiero ser ayudante',
    correo_profe: 'profe@example.com',
    actividad: 'Ayudar en clases',
    metodologia: 'Grupos pequeños',
    dia: 'Lunes',
    bloque: '1',
    puntuacion_etapa1: 15,
    puntuacion_etapa2: 0,
    cancelada_por_usuario: false,
    rechazada_por_jefatura: false,
    motivo_descarte: '',
    fecha_descarte: '',
    es_actual: true,
    consanguineos: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostulacionService,
        {
          provide: getRepositoryToken(Postulacion),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Asignatura),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: {
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Coordinador),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Alumno),
          useValue: {
            findOne: jest.fn(),
            findOneBy: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Ayudantia),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AsignaturaAlumno),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
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

    service = module.get<PostulacionService>(PostulacionService);
    postulacionRepository = module.get<Repository<Postulacion>>(getRepositoryToken(Postulacion));
    asignaturaRepository = module.get<Repository<Asignatura>>(getRepositoryToken(Asignatura));
    usuarioRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    alumnoRepository = module.get<Repository<Alumno>>(getRepositoryToken(Alumno));
    emailService = module.get<EmailService>(EmailService);
  });

  describe('create', () => {
    it('debe crear una postulación exitosamente', async () => {
      const createPostulacionDto = {
        rut_alumno: '12345678-9',
        id_asignatura: 1,
        nombre_asignatura: 'Matemática',
        descripcion_carta: 'Quiero ser ayudante',
        correo_profe: 'profe@example.com',
        actividad: 'Ayudar en clases',
        metodologia: 'Grupos pequeños',
        dia: 'Lunes',
        bloque: '1',
      };

      jest.spyOn(usuarioRepository, 'findOneBy').mockResolvedValue(mockUsuario);
      jest.spyOn(asignaturaRepository, 'findOneBy').mockResolvedValue(mockAsignatura);
      jest.spyOn(alumnoRepository, 'findOne').mockResolvedValue(mockAlumno);
      jest.spyOn(postulacionRepository, 'create').mockReturnValue(mockPostulacion);
      jest.spyOn(postulacionRepository, 'save').mockResolvedValue(mockPostulacion);

      const result = await service.create(createPostulacionDto);

      expect(result).toBeDefined();
      expect(postulacionRepository.save).toHaveBeenCalled();
    });

    it('debe retornar null si el usuario no existe', async () => {
      const createPostulacionDto = {
        rut_alumno: '99999999-9',
        id_asignatura: 1,
        nombre_asignatura: 'Matemática',
        descripcion_carta: 'Quiero ser ayudante',
        correo_profe: 'profe@example.com',
        actividad: 'Ayudar en clases',
        metodologia: 'Grupos pequeños',
        dia: 'Lunes',
        bloque: '1',
      };

      jest.spyOn(usuarioRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.create(createPostulacionDto);

      expect(result).toBeNull();
    });

    it('debe retornar null si la asignatura no existe', async () => {
      const createPostulacionDto = {
        rut_alumno: '12345678-9',
        id_asignatura: 999,
        nombre_asignatura: 'Matemática',
        descripcion_carta: 'Quiero ser ayudante',
        correo_profe: 'profe@example.com',
        actividad: 'Ayudar en clases',
        metodologia: 'Grupos pequeños',
        dia: 'Lunes',
        bloque: '1',
      };

      jest.spyOn(usuarioRepository, 'findOneBy').mockResolvedValue(mockUsuario);
      jest.spyOn(asignaturaRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.create(createPostulacionDto);

      expect(result).toBeNull();
    });

    it('debe retornar null si el id_asignatura es inválido', async () => {
      const createPostulacionDto = {
        rut_alumno: '12345678-9',
        id_asignatura: 'invalid' as any,
        nombre_asignatura: 'Matemática',
        descripcion_carta: 'Quiero ser ayudante',
        correo_profe: 'profe@example.com',
        actividad: 'Ayudar en clases',
        metodologia: 'Grupos pequeños',
        dia: 'Lunes',
        bloque: '1',
      };

      jest.spyOn(usuarioRepository, 'findOneBy').mockResolvedValue(mockUsuario);

      const result = await service.create(createPostulacionDto);

      expect(result).toBeNull();
    });
  });

  describe('cancel', () => {
    it('debe cancelar una postulación exitosamente', async () => {
      const id = 1;
      const cancelledPostulacion = { ...mockPostulacion, cancelada_por_usuario: true };

      jest.spyOn(postulacionRepository, 'findOneBy').mockResolvedValue(mockPostulacion);
      jest.spyOn(postulacionRepository, 'save').mockResolvedValue(cancelledPostulacion);

      const result = await service.cancel(id);

      expect(result!.cancelada_por_usuario).toBe(true);
      expect(postulacionRepository.save).toHaveBeenCalled();
    });

    it('debe retornar null si la postulación no existe', async () => {
      const id = 999;

      jest.spyOn(postulacionRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.cancel(id);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar una postulación exitosamente', async () => {
      const updateDto = {
        id: 1,
        descripcion_carta: 'Nueva descripción',
        actividad: 'Nueva actividad',
      };

      const updatedPostulacion = { ...mockPostulacion, ...updateDto };

      jest.spyOn(postulacionRepository, 'findOne').mockResolvedValue(mockPostulacion);
      jest.spyOn(postulacionRepository, 'save').mockResolvedValue(updatedPostulacion);

      const result = await service.update(updateDto);

      expect(result).toBeDefined();
      expect(postulacionRepository.save).toHaveBeenCalled();
    });

    it('debe retornar null si la postulación no existe', async () => {
      const updateDto = {
        id: 999,
        descripcion_carta: 'Nueva descripción',
      };

      jest.spyOn(postulacionRepository, 'findOne').mockResolvedValue(null);

      const result = await service.update(updateDto);

      expect(result).toBeNull();
    });

    it('debe retornar null si el usuario actualizado no existe', async () => {
      const updateDto = {
        id: 1,
        rut_alumno: '99999999-9',
      };

      jest.spyOn(postulacionRepository, 'findOne').mockResolvedValue(mockPostulacion);
      jest.spyOn(usuarioRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.update(updateDto);

      expect(result).toBeNull();
    });

    it('debe retornar null si la asignatura actualizada no existe', async () => {
      const updateDto = {
        id: 1,
        id_asignatura: 999,
      };

      jest.spyOn(postulacionRepository, 'findOne').mockResolvedValue(mockPostulacion);
      jest.spyOn(asignaturaRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.update(updateDto);

      expect(result).toBeNull();
    });
  });

  describe('puntuacionetapa2', () => {
    it('debe actualizar la puntuación etapa 2', async () => {
      const id = 1;
      const puntuacion = 18;
      const postulacionConPuntuacion = { ...mockPostulacion, puntuacion_etapa2: puntuacion };

      jest.spyOn(postulacionRepository, 'findOneBy').mockResolvedValue(mockPostulacion);
      jest.spyOn(postulacionRepository, 'save').mockResolvedValue(postulacionConPuntuacion);

      const result = await service.puntuacionetapa2(id, puntuacion);

      expect(result!.puntuacion_etapa2).toBe(puntuacion);
      expect(postulacionRepository.save).toHaveBeenCalled();
    });

    it('debe retornar null si la postulación no existe', async () => {
      const id = 999;
      const puntuacion = 18;

      jest.spyOn(postulacionRepository, 'findOneBy').mockResolvedValue(null);

      const result = await service.puntuacionetapa2(id, puntuacion);

      expect(result).toBeNull();
    });
  });

  describe('rechazarPorJefatura', () => {
    it('debe rechazar una postulación por jefatura y enviar correo', async () => {
      const id = 1;
      const descartarDto: DescartarDto = {
        motivo_descarte: 'No cumple requisitos',
        fecha_descarte: new Date().toISOString(),
        rechazada_por_jefatura: true,
      };

      const rechazadaPostulacion: Postulacion = {
        ...mockPostulacion,
        rechazada_por_jefatura: true,
        motivo_descarte: descartarDto.motivo_descarte,
        fecha_descarte: descartarDto.fecha_descarte,
      };

      jest.spyOn(postulacionRepository, 'findOne').mockResolvedValue(mockPostulacion);
      jest.spyOn(postulacionRepository, 'save').mockResolvedValue(rechazadaPostulacion);
      jest.spyOn(alumnoRepository, 'findOneBy').mockResolvedValue(mockAlumno);
      jest.spyOn(emailService, 'send').mockResolvedValue(undefined);

      const result = await service.rechazarPorJefatura(id, descartarDto);

      expect(result!.rechazada_por_jefatura).toBe(true);
      expect(emailService.send).toHaveBeenCalled();
    });

    it('debe retornar null si la postulación no existe', async () => {
      const id = 999;
      const descartarDto: DescartarDto = {
        motivo_descarte: 'No cumple requisitos',
        fecha_descarte: new Date().toISOString(),
        rechazada_por_jefatura: true,
      };

      jest.spyOn(postulacionRepository, 'findOne').mockResolvedValue(null);

      const result = await service.rechazarPorJefatura(id, descartarDto);

      expect(result).toBeNull();
    });
  });

  describe('Métodos privados de cálculo de puntuación', () => {
    it('calcularAprobacionSemestres debe retornar 5 si la nota es >= 4 y no tiene atraso', () => {
      const asignaturaAlumno = { ...mockAsignaturaAlumno, nota: 6.0 };
      const alumno = mockAlumno;
      const asignatura = mockAsignatura;

      const result = service['calcularAprobacionSemestres'](asignaturaAlumno, alumno, asignatura, [asignaturaAlumno]);

      expect(result).toBe(5);
    });

    it('calcularCalificacionAsignatura debe devolver puntuación basada en la nota', () => {
      const asignaturaAlumno = { ...mockAsignaturaAlumno, nota: 6.0 };

      const result = service['calcularCalificacionAsignatura'](asignaturaAlumno);

      expect(result).toBe(6);
    });

    it('calcularPromedioCarrera debe devolver puntuación basada en el promedio', () => {
      const alumno = { ...mockAlumno, promedio: 5.5 };

      const result = service['calcularPromedioCarrera'](alumno);

      expect(result).toBe(5.5);
    });

    it('calcularOportunidadAprobacion debe retornar 2 para primera oportunidad', () => {
      const asignaturaAlumno = { ...mockAsignaturaAlumno, oportunidad: 1 };

      const result = service['calcularOportunidadAprobacion'](asignaturaAlumno);

      expect(result).toBe(2);
    });

    it('calcularOportunidadAprobacion debe retornar 1 para segunda oportunidad', () => {
      const asignaturaAlumno = { ...mockAsignaturaAlumno, oportunidad: 2 };

      const result = service['calcularOportunidadAprobacion'](asignaturaAlumno);

      expect(result).toBe(1);
    });

    it('calcularOportunidadAprobacion debe retornar 0 para tercera oportunidad en adelante', () => {
      const asignaturaAlumno = { ...mockAsignaturaAlumno, oportunidad: 3 };

      const result = service['calcularOportunidadAprobacion'](asignaturaAlumno);

      expect(result).toBe(0);
    });

    it('calcularAyudantiasPrevias debe retornar 3 si tiene la misma asignatura', () => {
      const ayudantiasPrevias: Ayudantia[] = [
        { ...mockAyudantia, asignatura: mockAsignatura },
      ];

      const result = service['calcularAyudantiasPrevias'](ayudantiasPrevias, mockAsignatura.id);

      expect(result).toBe(3);
    });

    it('calcularAyudantiasPrevias debe retornar 1 si tiene otras asignaturas', () => {
      const ayudantiasPrevias: Ayudantia[] = [
        { ...mockAyudantia, asignatura: { ...mockAsignatura, id: 2, nombre: 'Otra' } },
      ];

      const result = service['calcularAyudantiasPrevias'](ayudantiasPrevias, mockAsignatura.id);

      expect(result).toBe(1);
    });

    it('calcularAyudantiasPrevias debe retornar 0 si no tiene ayudantías previas', () => {
      const ayudantiasPrevias: Ayudantia[] = [];

      const result = service['calcularAyudantiasPrevias'](ayudantiasPrevias, mockAsignatura.id);

      expect(result).toBe(0);
    });
  });
});
