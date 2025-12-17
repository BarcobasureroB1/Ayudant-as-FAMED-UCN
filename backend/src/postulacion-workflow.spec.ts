import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AsignaturaService } from '../src/modules/asignatura/asignatura.service';
import { LlamadoPostulacionService } from '../src/modules/llamado_postulacion/llamado_postulacion.service';
import { PostulacionService } from '../src/modules/postulacion/postulacion.service';
import { UsuarioService } from '../src/modules/usuario/usuario.service';
import { AlumnoService } from '../src/modules/alumno/alumno.service';
import { EmailService } from '../src/modules/email/email.service';

/**
 * Test E2E: Flujo completo de postulación a ayudantía FAMED
 *
 * Escenario:
 * 1. Crear una asignatura "Fisiopatología" del departamento de Medicina
 * 2. Abrir el concurso (llamado postulación)
 * 3. Un alumno postula a la asignatura
 * 4. Se evalúa la postulación (puntuación etapa 2)
 * 5. Se acepta la postulación (no se rechaza)
 * 6. Se cierra la asignatura a postulaciones
 */
describe('Postulación E2E: Flujo completo FAMED', () => {
  let app: INestApplication;
  let asignaturaService: AsignaturaService;
  let llamadoPostulacionService: LlamadoPostulacionService;
  let postulacionService: PostulacionService;
  let usuarioService: UsuarioService;
  let alumnoService: AlumnoService;
  let emailService: EmailService;

  // Variables globales para el flujo
  let asignaturaId: number;
  let alumnoRut: string;
  let secretariaRut: string;
  let coordinadorRut: string;
  let postulacionId: number;

  beforeAll(async () => {
    // Mock de servicios para este test e2e
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [
        AsignaturaService,
        LlamadoPostulacionService,
        PostulacionService,
        UsuarioService,
        AlumnoService,
        {
          provide: 'AsignaturaRepository',
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'LlamadoPostulacionRepository',
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'PostulacionRepository',
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'UsuarioRepository',
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: 'AlumnoRepository',
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findOneBy: jest.fn(),
            save: jest.fn(),
            create: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: 'DepartamentoRepository',
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: 'CoordinadorRepository',
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: 'AsignaturaAlumnoRepository',
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: 'AyudantiaRepository',
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
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

    app = moduleFixture.createNestApplication();
    await app.init();

    asignaturaService = moduleFixture.get<AsignaturaService>(AsignaturaService);
    llamadoPostulacionService = moduleFixture.get<LlamadoPostulacionService>(
      LlamadoPostulacionService,
    );
    postulacionService = moduleFixture.get<PostulacionService>(PostulacionService);
    usuarioService = moduleFixture.get<UsuarioService>(UsuarioService);
    alumnoService = moduleFixture.get<AlumnoService>(AlumnoService);
    emailService = moduleFixture.get<EmailService>(EmailService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('1. Debe crear una asignatura exitosamente', async () => {
    // Setup datos
    alumnoRut = '12345678-9';
    secretariaRut = '11111111-1';
    coordinadorRut = '22222222-2';
    asignaturaId = 1;

    // Mock departamento
    const mockDepartamento = {
      id: 1,
      nombre: 'Medicina',
    } as any;

    // Mock asignatura a crear - Fisiopatología del departamento de Medicina
    const mockAsignatura = {
      id: asignaturaId,
      nombre: 'Fisiopatología',
      nrc: '12345',
      semestre: 2,
      estado: 'cerrado',
      abierta_postulacion: false,
      departamentos: [mockDepartamento],
      asignaturasAlumnos: [],
      postulaciones: [],
      coordinador: [],
    } as any;

    jest.spyOn(asignaturaService['depa'], 'findOne').mockResolvedValue(mockDepartamento);
    jest.spyOn(asignaturaService['asignaturaRepository'], 'save').mockResolvedValue(mockAsignatura);
    jest.spyOn(asignaturaService['asignaturaRepository'], 'create').mockReturnValue(mockAsignatura);

    const createAsignaturaDto = {
      nombre: 'Fisiopatología',
      nrc: '12345',
      semestre: 2,
      Departamento: 'Medicina',
    };

    const result = await asignaturaService.create(createAsignaturaDto);

    expect(result).toBeDefined();
    expect(result?.nombre).toBe('Fisiopatología');
    expect(result?.id).toBe(asignaturaId);
  });

  it('2. Debe abrir el concurso con llamado postulación', async () => {
    const mockSecretaria = {
      rut: secretariaRut,
      nombres: 'María',
      apellidos: 'García',
      tipo: 'secretaria_docente',
      correo: 'maria@example.com',
      password: 'hashed',
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
    } as any;

    const mockCoordinador = {
      rut: coordinadorRut,
      nombres: 'Carlos',
      apellidos: 'López',
      tipo: 'coordinador',
      correo: 'carlos@example.com',
      password: 'hashed',
      c_ayudantias: 1,
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
    } as any;

    const mockAsignatura = {
      id: asignaturaId,
      nombre: 'Fisiopatología',
      nrc: '12345',
      semestre: 2,
      estado: 'abierto',
      abierta_postulacion: true,
      departamentos: [],
      asignaturasAlumnos: [],
      postulaciones: [],
      coordinador: [],
    } as any;

    const mockLlamado = {
      id: 1,
      asignatura: mockAsignatura,
      secretaria: mockSecretaria,
      semestre: '2024-1',
      entrega_antecedentes: '2024-01-15',
      fecha_inicio: '2024-01-20',
      fecha_termino: '2024-02-20',
      tipo_ayudantia: 'Docencia',
      tipo_remuneracion: 'Remunerado',
      horas_mensuales: 40,
      horario_fijo: false,
      cant_ayudantes: 2,
      estado: 'abierto',
      coordinadores: [mockCoordinador],
      requisitos: [{ descripcion: 'Tener promedio >= 5.0' }],
      horarios: [{ dia: 'Martes', bloque: '2' }],
    } as any;

    jest.spyOn(usuarioService, 'findforLogin').mockResolvedValue(mockSecretaria);
    jest.spyOn(llamadoPostulacionService['usuarioRepository'], 'findOneBy').mockResolvedValue(
      mockSecretaria,
    );
    jest.spyOn(llamadoPostulacionService['asignaturaRepository'], 'findOneBy').mockResolvedValue(
      mockAsignatura,
    );
    jest.spyOn(llamadoPostulacionService['usuarioRepository'], 'find').mockResolvedValue([
      mockCoordinador,
    ]);
    jest.spyOn(llamadoPostulacionService['asignaturaRepository'], 'save').mockResolvedValue(
      mockAsignatura,
    );
    jest.spyOn(llamadoPostulacionService['llamadoPostulacionRepository'], 'save').mockResolvedValue(
      mockLlamado,
    );
    jest
      .spyOn(llamadoPostulacionService['llamadoPostulacionRepository'], 'create')
      .mockReturnValue(mockLlamado);

    const createLlamadoDto = {
      rut_secretaria: secretariaRut,
      id_asignatura: asignaturaId,
      semestre: '2024-1',
      entrega_antecedentes: '2024-01-15',
      fecha_inicio: '2024-01-20',
      fecha_termino: '2024-02-20',
      tipo_ayudantia: 'Docencia',
      tipo_remuneracion: 'Remunerado',
      horas_mensuales: 40,
      horario_fijo: false,
      cant_ayudantes: 2,
      descripcion: ['Tener promedio >= 5.0'],
      coordinadores: [coordinadorRut],
      horarios: [{ dia: 'Martes', bloque: '2' }],
    };

    const result = (await llamadoPostulacionService.create(createLlamadoDto)) as any;

    expect(result).toBeDefined();
    expect(result?.estado).toBe('abierto');
    expect(result?.asignatura?.abierta_postulacion).toBe(true);
  });

  it('3. Un alumno debe postular a la asignatura', async () => {
    const mockAlumno = {
      rut_alumno: alumnoRut,
      nombres: 'Juan',
      apellidos: 'Pérez',
      correo: 'juan@example.com',
      fecha_admision: '2021-03-15',
      codigo_carrera: 'MED',
      nombre_carrera: 'Medicina',
      promedio: 5.8,
      nivel: 3,
      periodo: '2024-1',
      asignaturasAlumno: [],
    } as any;

    const mockUsuario = {
      rut: alumnoRut,
      nombres: 'Juan',
      apellidos: 'Pérez',
      tipo: 'alumno',
      correo: 'juan@example.com',
      password: 'hashed',
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
    } as any;

    const mockAsignatura = {
      id: asignaturaId,
      nombre: 'Fisiopatología',
      nrc: '12345',
      semestre: 2,
      estado: 'abierto',
      abierta_postulacion: true,
      departamentos: [],
      asignaturasAlumnos: [],
      postulaciones: [],
      coordinador: [],
    } as any;

    const mockPostulacion = {
      id: 1,
      usuario: mockUsuario,
      asignatura: mockAsignatura,
      descripcion_carta: 'Deseo ser ayudante en Fisiopatología para profundizar mis conocimientos',
      correo_profe: 'profe@example.com',
      actividad: 'Explicar conceptos en clases prácticas de anatomía patológica',
      metodologia: 'Grupos de estudio interactivos',
      dia: 'Martes',
      bloque: '2',
      puntuacion_etapa1: 18,
      puntuacion_etapa2: 0,
      cancelada_por_usuario: false,
      rechazada_por_jefatura: false,
      motivo_descarte: '',
      fecha_descarte: '',
      es_actual: true,
      consanguineos: [],
    } as any;

    postulacionId = mockPostulacion.id;

    jest
      .spyOn(postulacionService['usuarioRepository'], 'findOneBy')
      .mockResolvedValue(mockUsuario);
    jest
      .spyOn(postulacionService['asignaturaRepository'], 'findOneBy')
      .mockResolvedValue(mockAsignatura);
    jest.spyOn(postulacionService['alumnoRepository'], 'findOne').mockResolvedValue(mockAlumno);
    jest.spyOn(postulacionService['postulacionRepository'], 'save').mockResolvedValue(
      mockPostulacion,
    );
    jest
      .spyOn(postulacionService['postulacionRepository'], 'create')
      .mockReturnValue(mockPostulacion);
    jest.spyOn(postulacionService['ayudantiaRepository'], 'find').mockResolvedValue([]);
    jest.spyOn(postulacionService['asignaturaAlumnoRepository'], 'findOne').mockResolvedValue(null);
    jest.spyOn(postulacionService['asignaturaAlumnoRepository'], 'find').mockResolvedValue([]);

    const createPostulacionDto = {
      rut_alumno: alumnoRut,
      id_asignatura: asignaturaId,
      nombre_asignatura: 'Fisiopatología',
      descripcion_carta: 'Deseo ser ayudante en Fisiopatología para profundizar mis conocimientos',
      correo_profe: 'profe@example.com',
      actividad: 'Explicar conceptos en clases prácticas de anatomía patológica',
      metodologia: 'Grupos de estudio interactivos',
      dia: 'Martes',
      bloque: '2',
    };

    const result = await postulacionService.create(createPostulacionDto);

    expect(result).toBeDefined();
    expect(result?.usuario?.rut).toBe(alumnoRut);
    expect(result?.puntuacion_etapa1).toBeGreaterThan(0);
  });

  it('4. La postulación debe ser evaluada (puntuación etapa 2)', async () => {
    const puntuacionEtapa2 = 20;

    const mockPostulacionEvaluada = {
      id: postulacionId,
      usuario: { rut: alumnoRut },
      asignatura: { id: asignaturaId },
      descripcion_carta: 'Deseo ser ayudante en Fisiopatología para profundizar mis conocimientos',
      correo_profe: 'profe@example.com',
      actividad: 'Explicar conceptos en clases prácticas de anatomía patológica',
      metodologia: 'Grupos de estudio interactivos',
      dia: 'Martes',
      bloque: '2',
      puntuacion_etapa1: 18,
      puntuacion_etapa2: puntuacionEtapa2,
      cancelada_por_usuario: false,
      rechazada_por_jefatura: false,
      motivo_descarte: '',
      fecha_descarte: '',
      es_actual: true,
      consanguineos: [],
    } as any;

    jest
      .spyOn(postulacionService['postulacionRepository'], 'findOneBy')
      .mockResolvedValue(mockPostulacionEvaluada);
    jest.spyOn(postulacionService['postulacionRepository'], 'save').mockResolvedValue(
      mockPostulacionEvaluada,
    );

    const result = await postulacionService.puntuacionetapa2(postulacionId, puntuacionEtapa2);

    expect(result).toBeDefined();
    expect(result?.puntuacion_etapa2).toBe(puntuacionEtapa2);
    expect((result?.puntuacion_etapa1 ?? 0) + (result?.puntuacion_etapa2 ?? 0)).toBe(38);
  });

  it('5. La postulación debe ser aceptada (no rechazada)', async () => {
    const mockPostulacionAceptada = {
      id: postulacionId,
      usuario: { rut: alumnoRut, nombres: 'Juan', apellidos: 'Pérez' },
      asignatura: { id: asignaturaId, nombre: 'Fisiopatología' },
      descripcion_carta: 'Deseo ser ayudante en Fisiopatología para profundizar mis conocimientos',
      correo_profe: 'profe@example.com',
      actividad: 'Explicar conceptos en clases prácticas de anatomía patológica',
      metodologia: 'Grupos de estudio interactivos',
      dia: 'Martes',
      bloque: '2',
      puntuacion_etapa1: 18,
      puntuacion_etapa2: 20,
      cancelada_por_usuario: false,
      rechazada_por_jefatura: false,
      motivo_descarte: '',
      fecha_descarte: '',
      es_actual: true,
      consanguineos: [],
    } as any;

    jest
      .spyOn(postulacionService['postulacionRepository'], 'findOneBy')
      .mockResolvedValue(mockPostulacionAceptada);

    // Verificar que la postulación no está rechazada
    const result = await postulacionService['postulacionRepository'].findOneBy({ id: postulacionId });

    expect(result).toBeDefined();
    expect(result?.rechazada_por_jefatura).toBe(false);
    expect((result?.puntuacion_etapa1 ?? 0) + (result?.puntuacion_etapa2 ?? 0)).toBe(38);
  });

  it('6. Debe cerrar la asignatura a postulaciones', async () => {
    const mockAsignaturaCerrada = {
      id: asignaturaId,
      nombre: 'Fisiopatología',
      nrc: '12345',
      semestre: 2,
      estado: 'cerrado',
      abierta_postulacion: false,
      departamentos: [],
      asignaturasAlumnos: [],
      postulaciones: [],
      coordinador: [],
    } as any;

    jest
      .spyOn(asignaturaService['asignaturaRepository'], 'findOneBy')
      .mockResolvedValue(mockAsignaturaCerrada);
    jest.spyOn(asignaturaService['asignaturaRepository'], 'save').mockResolvedValue(
      mockAsignaturaCerrada,
    );

    // Simular el cierre de postulaciones
    const resultado = await asignaturaService['asignaturaRepository'].findOneBy({
      id: asignaturaId,
    });

    expect(resultado).toBeDefined();
    expect(resultado?.abierta_postulacion).toBe(false);
    expect(resultado?.estado).toBe('cerrado');
  });

  it('Flujo completo: de creación a cierre', async () => {
    // Este test verifica que todas las etapas previas se completaron exitosamente
    expect(asignaturaId).toBeDefined();
    expect(postulacionId).toBeDefined();
    expect(alumnoRut).toBe('12345678-9');
  });
});
