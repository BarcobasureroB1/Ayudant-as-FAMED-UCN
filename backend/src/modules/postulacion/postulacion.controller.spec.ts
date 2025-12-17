import { Test, TestingModule } from '@nestjs/testing';
import { PostulacionController } from './postulacion.controller';
import { PostulacionService } from './postulacion.service';
import { Postulacion } from './entities/postulacion.entity';

describe('PostulacionController', () => {
  let controller: PostulacionController;
  let service: PostulacionService;

  const mockPostulacionService = {
    create: jest.fn(),
    cancel: jest.fn(),
    findcurrent: jest.fn(),
    update: jest.fn(),
    findAllCurrent: jest.fn(),
    findPostulacionesByCoordinadorRut: jest.fn(),
    findPostulacionesByCoordinadores: jest.fn(),
    puntuacionetapa2: jest.fn(),
    rechazarPorJefatura: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostulacionController],
      providers: [
        {
          provide: PostulacionService,
          useValue: mockPostulacionService,
        },
      ],
    }).compile();

    controller = module.get<PostulacionController>(PostulacionController);
    service = module.get<PostulacionService>(PostulacionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('debe crear una postulación', async () => {
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

      const mockPostulacion: Postulacion = {
        id: 1,
        usuario: null as any,
        asignatura: null as any,
        descripcion_carta: createPostulacionDto.descripcion_carta,
        correo_profe: createPostulacionDto.correo_profe,
        actividad: createPostulacionDto.actividad,
        metodologia: createPostulacionDto.metodologia,
        dia: createPostulacionDto.dia,
        bloque: createPostulacionDto.bloque,
        puntuacion_etapa1: 15,
        puntuacion_etapa2: 0,
        cancelada_por_usuario: false,
        rechazada_por_jefatura: false,
        motivo_descarte: '',
        fecha_descarte: '',
        es_actual: true,
        consanguineos: [],
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockPostulacion);

      const result = await controller.create(createPostulacionDto);

      expect(service.create).toHaveBeenCalledWith(createPostulacionDto);
      expect(result).toEqual(mockPostulacion);
    });
  });

  describe('cancel', () => {
    it('debe cancelar una postulación', async () => {
      const postulacionId = '1';
      const mockCancelledPostulacion: Postulacion = {
        id: 1,
        usuario: null as any,
        asignatura: null as any,
        descripcion_carta: 'carta',
        correo_profe: '',
        actividad: '',
        metodologia: '',
        dia: '',
        bloque: '',
        puntuacion_etapa1: 0,
        puntuacion_etapa2: 0,
        cancelada_por_usuario: true,
        rechazada_por_jefatura: false,
        motivo_descarte: '',
        fecha_descarte: '',
        es_actual: true,
        consanguineos: [],
      };

      jest.spyOn(service, 'cancel').mockResolvedValue(mockCancelledPostulacion);

      const result = await controller.cancel(postulacionId);

      expect(service.cancel).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockCancelledPostulacion);
    });
  });

  describe('findOne', () => {
    it('debe obtener postulaciones actuales de un alumno', async () => {
      const rutAlumno = '12345678-9';
      const mockPostulaciones = [
        {
          id: 1,
          nombre_asignatura: 'Matemática',
          descripcion_carta: 'Quiero ser ayudante',
          correo_profe: '',
          actividad: '',
          metodologia: '',
          dia: '',
          bloque: '',
          puntuacion_etapa1: 0,
          puntuacion_etapa2: 0,
          cancelada_por_usuario: false,
          rechazada_por_jefatura: false,
        },
      ];

      jest.spyOn(service, 'findcurrent').mockResolvedValue(mockPostulaciones);

      const result = await controller.findOne(rutAlumno);

      expect(service.findcurrent).toHaveBeenCalledWith(rutAlumno);
      expect(result).toEqual(mockPostulaciones);
    });
  });

  describe('update', () => {
    it('debe actualizar una postulación', async () => {
      const updatePostulacionDto = {
        id: 1,
        descripcion_carta: 'Nueva descripción',
      };

      const mockUpdatedPostulacion: Postulacion = {
        id: 1,
        usuario: null as any,
        asignatura: null as any,
        descripcion_carta: 'Nueva descripción',
        correo_profe: '',
        actividad: '',
        metodologia: '',
        dia: '',
        bloque: '',
        puntuacion_etapa1: 0,
        puntuacion_etapa2: 0,
        cancelada_por_usuario: false,
        rechazada_por_jefatura: false,
        motivo_descarte: '',
        fecha_descarte: '',
        es_actual: true,
        consanguineos: [],
      };

      jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedPostulacion);

      const result = await controller.update(updatePostulacionDto);

      expect(service.update).toHaveBeenCalledWith(updatePostulacionDto);
      expect(result).toEqual(mockUpdatedPostulacion);
    });
  });

  describe('findAll', () => {
    it('debe obtener todas las postulaciones actuales', async () => {
      const mockPostulaciones = [
        {
          id: 1,
          alumno: {
            rut: '12345678-9',
            nombres: 'Juan',
            apellidos: 'Pérez',
          },
          descripcion_carta: 'carta',
          correo_profe: '',
          actividad: '',
          metodologia: '',
          dia: '',
          bloque: '',
          nombre_asignatura: 'Matemática',
          puntuacion_etapa1: 15,
          puntuacion_etapa2: 0,
          cancelada_por_usuario: false,
          rechazada_por_jefatura: false,
        },
      ];

      jest.spyOn(service, 'findAllCurrent').mockResolvedValue(mockPostulaciones);

      const result = await controller.findAll();

      expect(service.findAllCurrent).toHaveBeenCalled();
      expect(result).toEqual(mockPostulaciones);
    });
  });

  describe('findByCoordinador', () => {
    it('debe obtener postulaciones de un coordinador específico', async () => {
      const rutCoordinador = '98765432-1';
      const mockPostulaciones = [
        {
          id: 1,
          rut_alumno: '12345678-9',
          alumno: {
            rut: '12345678-9',
            nombres: 'Juan',
            apellidos: 'Pérez',
            correo: undefined,
          },
          id_asignatura: 1,
          descripcion_carta: 'carta',
          correo_profe: '',
          actividad: '',
          metodologia: '',
          dia: '',
          bloque: '',
          nombre_asignatura: 'Matemática',
          puntuacion_etapa1: 0,
          puntuacion_etapa2: 0,
          coordinador: {
            rut: rutCoordinador,
            nombres: '',
            apellidos: '',
          },
          motivo_descarte: null,
          fecha_descarte: null,
          rechazada_por_jefatura: false,
          cancelada_por_usuario: false,
        },
      ];

      jest.spyOn(service, 'findPostulacionesByCoordinadorRut').mockResolvedValue(mockPostulaciones);

      const result = await controller.findByCoordinador(rutCoordinador);

      expect(service.findPostulacionesByCoordinadorRut).toHaveBeenCalledWith(rutCoordinador);
      expect(result).toEqual(mockPostulaciones);
    });
  });

  describe('findAllByCoordinador', () => {
    it('debe obtener todas las postulaciones de coordinadores', async () => {
      const mockPostulaciones = [
        {
          id: 1,
          rut_alumno: '12345678-9',
          alumno: {
            rut: '12345678-9',
            nombres: 'Juan',
            apellidos: 'Pérez',
            correo: undefined,
          },
          id_asignatura: 1,
          descripcion_carta: 'carta',
          correo_profe: '',
          actividad: '',
          metodologia: '',
          dia: '',
          bloque: '',
          nombre_asignatura: 'Matemática',
          puntuacion_etapa1: 0,
          puntuacion_etapa2: 0,
          motivo_descarte: null,
          fecha_descarte: null,
          rechazada_por_jefatura: false,
          cancelada_por_usuario: false,
          coordinador: null,
        },
      ];

      jest.spyOn(service, 'findPostulacionesByCoordinadores').mockResolvedValue(mockPostulaciones);

      const result = await controller.findAllByCoordinador();

      expect(service.findPostulacionesByCoordinadores).toHaveBeenCalled();
      expect(result).toEqual(mockPostulaciones);
    });
  });

  describe('puntuacionetapa2', () => {
    it('debe actualizar la puntuación etapa 2', async () => {
      const postulacionId = '1';
      const puntuarDto = { puntuacion_etapa2: 18 };
      const mockUpdatedPostulacion: Postulacion = {
        id: 1,
        usuario: null as any,
        asignatura: null as any,
        descripcion_carta: '',
        correo_profe: '',
        actividad: '',
        metodologia: '',
        dia: '',
        bloque: '',
        puntuacion_etapa1: 0,
        puntuacion_etapa2: 18,
        cancelada_por_usuario: false,
        rechazada_por_jefatura: false,
        motivo_descarte: '',
        fecha_descarte: '',
        es_actual: true,
        consanguineos: [],
      };

      jest.spyOn(service, 'puntuacionetapa2').mockResolvedValue(mockUpdatedPostulacion);

      const result = await controller.puntuacionetapa2(postulacionId, puntuarDto);

      expect(service.puntuacionetapa2).toHaveBeenCalledWith(1, 18);
      expect(result).toEqual(mockUpdatedPostulacion);
    });
  });

  describe('rechazarPorJefatura', () => {
    it('debe rechazar una postulación por jefatura', async () => {
      const postulacionId = '1';
      const descartarDto = {
        motivo_descarte: 'No cumple requisitos',
        fecha_descarte: new Date().toISOString(),
        rechazada_por_jefatura: true,
      };

      const mockRechazadaPostulacion: Postulacion = {
        id: 1,
        usuario: null as any,
        asignatura: null as any,
        descripcion_carta: '',
        correo_profe: '',
        actividad: '',
        metodologia: '',
        dia: '',
        bloque: '',
        puntuacion_etapa1: 0,
        puntuacion_etapa2: 0,
        cancelada_por_usuario: false,
        rechazada_por_jefatura: true,
        motivo_descarte: descartarDto.motivo_descarte,
        fecha_descarte: descartarDto.fecha_descarte,
        es_actual: true,
        consanguineos: [],
      };

      jest.spyOn(service, 'rechazarPorJefatura').mockResolvedValue(mockRechazadaPostulacion);

      const result = await controller.descartarPostulacion(postulacionId, descartarDto as any);

      expect(service.rechazarPorJefatura).toHaveBeenCalledWith(1, descartarDto as any);
      expect(result).toEqual(mockRechazadaPostulacion);
    });
  });
});
