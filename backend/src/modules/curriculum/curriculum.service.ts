import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
import { UpdateCurriculumDto } from './dto/update-curriculum.dto';
import { Curriculum } from './entities/curriculum.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioService } from '../usuario/usuario.service';
import { AyudantiasCurriculum } from '../ayudantias_curriculum/entities/ayudantias_curriculum.entity';
import { TitulosCurso } from '../titulos_cursos/entities/titulos_curso.entity';
import { ActividadesCientifica } from '../actividades_cientificas/entities/actividades_cientifica.entity';
import { ActividadesExtracurriculare } from '../actividades_extracurriculares/entities/actividades_extracurriculare.entity';
import { Alumno } from '../alumno/entities/alumno.entity';


@Injectable()
export class CurriculumService {
  constructor(
    @InjectRepository(Curriculum)
    private readonly curriculumRepository: Repository<Curriculum>,
    @InjectRepository(AyudantiasCurriculum)
    private readonly ayudantiasCurriculumRepository: Repository<AyudantiasCurriculum>,
    @InjectRepository(TitulosCurso)
    private readonly titulosCursoRepository: Repository<TitulosCurso>,
    @InjectRepository(ActividadesCientifica)
    private readonly actividadesCientificaRepository: Repository<ActividadesCientifica>,
    @InjectRepository(ActividadesExtracurriculare)
    private readonly actividadesExtracurriculareRepository: Repository<ActividadesExtracurriculare>,
    private readonly usuarioService: UsuarioService,
    @InjectRepository(Alumno)
    private readonly alumnoRepository: Repository<Alumno>,
    
  ) {}

  async create(data: CreateCurriculumDto) {
    const rut = data.rut_alumno;
    const usuario = await this.usuarioService.findOne(rut);

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Si no es admin, validar que exista el alumno
    if (usuario.tipo !== 'admin') {
      const alumno = await this.alumnoRepository.findOneBy({ rut_alumno: rut });
      if (!alumno) {
        throw new Error('Alumno no encontrado');
      }
    }

    // Ejecutar todo en una transacción para asegurar rollback si alguna operación falla
    return await this.curriculumRepository.manager.transaction(
      async (transactionalEntityManager) => {
        const curriculumRepo = transactionalEntityManager.getRepository(Curriculum);
        const ayudantiasRepo = transactionalEntityManager.getRepository(AyudantiasCurriculum);
        const titulosRepo = transactionalEntityManager.getRepository(TitulosCurso);
        const cientificasRepo = transactionalEntityManager.getRepository(ActividadesCientifica);
        const extracurricularesRepo = transactionalEntityManager.getRepository(ActividadesExtracurriculare);

        // Crear y guardar curriculum
        const curriculum = curriculumRepo.create({
          usuario: usuario,
          nombres: data.nombres,
          apellidos: data.apellidos,
          fecha_nacimiento: data.fecha_nacimiento,
          comuna: data.comuna,
          ciudad: data.ciudad,
          Num_Celular: data.num_celular,
          correo: data.correo,
          carrera: data.carrera,
          otros: data.otros,
        });
        await curriculumRepo.save(curriculum);

        // Si alguna de las siguientes operaciones lanza, la transacción hace rollback automáticamente

        if (data.ayudantias?.length) {
          const ayudantias = data.ayudantias.map((a) =>
            ayudantiasRepo.create({
              usuario,
              nombre_asig: a.nombre_asig,
              nombre_coordinador: a.nombre_coordinador,
              evaluacion: a.evaluacion_obtenida,
            }),
          );
          await ayudantiasRepo.save(ayudantias);
        }

        if (data.cursos_titulos_grados?.length) {
          const titulos = data.cursos_titulos_grados.map((c) =>
            titulosRepo.create({
              usuario,
              nombre_asig: c.nombre_asig,
              n_coordinador: c.n_coordinador,
              evaluacion: c.evaluacion,
            }),
          );
          await titulosRepo.save(titulos);
        }

        if (data.actividades_cientificas?.length) {
          const cientificas = data.actividades_cientificas.map((a) =>
            cientificasRepo.create({
              usuario,
              nombre: a.nombre,
              descripcion: a.descripcion,
              periodo_participacion: a.periodo_participacion,
            }),
          );
          await cientificasRepo.save(cientificas);
        }

        if (data.actividades_extracurriculares?.length) {
          const extra = data.actividades_extracurriculares.map((a) =>
            extracurricularesRepo.create({
              usuario,
              nombre: a.nombre,
              docente: a.docente,
              descripcion: a.descripcion,
              periodo_participacion: a.periodo_participacion,
            }),
          );
          await extracurricularesRepo.save(extra);
        }

        // Retornar el curriculum creado (puedes ajustar para devolver relaciones si lo deseas)
        return curriculum;
      },
    );
  }

  /**
   * Actualiza un curriculum existente y sus entidades relacionadas dentro de una transacción.
   * Recibe un DTO similar a CreateCurriculumDto pero con el campo `id`.
   */
  async update(data: UpdateCurriculumDto) {
    // Buscar el curriculum a actualizar primero
    const existing = await this.curriculumRepository.findOne({ where: { id: data.id }, relations: ['usuario'] });
    if (!existing) {
      throw new NotFoundException('Curriculum no encontrado');
    }

    // Determinar rut a validar: si viene en el DTO usarlo, sino usar el del curriculum existente
    const rut = data.rut_alumno ?? existing.usuario?.rut;
    const usuario = await this.usuarioService.findOne(rut);

    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Si no es admin, validar que exista el alumno
    if (usuario.tipo !== 'admin') {
      const alumno = await this.alumnoRepository.findOneBy({ rut_alumno: rut });
      if (!alumno) {
        throw new NotFoundException('Alumno no encontrado');
      }
    }

    // Ejecutar todo en una transacción
    return await this.curriculumRepository.manager.transaction(async (transactionalEntityManager) => {
      const curriculumRepo = transactionalEntityManager.getRepository(Curriculum);
      const ayudantiasRepo = transactionalEntityManager.getRepository(AyudantiasCurriculum);
      const titulosRepo = transactionalEntityManager.getRepository(TitulosCurso);
      const cientificasRepo = transactionalEntityManager.getRepository(ActividadesCientifica);
      const extracurricularesRepo = transactionalEntityManager.getRepository(ActividadesExtracurriculare);

    // Actualizar campos del curriculum sólo si vienen en el DTO
    if (data.nombres !== undefined) existing.nombres = data.nombres;
    if (data.apellidos !== undefined) existing.apellidos = data.apellidos;
    if (data.fecha_nacimiento !== undefined) existing.fecha_nacimiento = data.fecha_nacimiento;
    if (data.comuna !== undefined) existing.comuna = data.comuna;
    if (data.ciudad !== undefined) existing.ciudad = data.ciudad;
    if (data.num_celular !== undefined) existing.Num_Celular = data.num_celular;
    if (data.correo !== undefined) existing.correo = data.correo;
    if (data.carrera !== undefined) existing.carrera = data.carrera;
    if (data.otros !== undefined) existing.otros = data.otros;

      await curriculumRepo.save(existing);

      // Para cada colección relacionada: si la propiedad viene en el DTO
      // (incluso como array vacío) se reemplazan las entradas; si la propiedad
      // es undefined, se mantienen las entradas existentes.

      if (data.ayudantias !== undefined) {
        const existingAyudantias = await ayudantiasRepo.find({ where: { usuario: { rut } } });
        if (existingAyudantias.length) await ayudantiasRepo.remove(existingAyudantias);

        if (data.ayudantias.length) {
          const ayudantias = data.ayudantias.map((a) =>
            ayudantiasRepo.create({
              usuario,
              nombre_asig: a.nombre_asig,
              nombre_coordinador: a.nombre_coordinador,
              evaluacion: a.evaluacion_obtenida,
            }),
          );
          await ayudantiasRepo.save(ayudantias);
        }
      }

      if (data.cursos_titulos_grados !== undefined) {
        const existingTitulos = await titulosRepo.find({ where: { usuario: { rut } } });
        if (existingTitulos.length) await titulosRepo.remove(existingTitulos);

        if (data.cursos_titulos_grados.length) {
          const titulos = data.cursos_titulos_grados.map((c) =>
            titulosRepo.create({
              usuario,
              nombre_asig: c.nombre_asig,
              n_coordinador: c.n_coordinador,
              evaluacion: c.evaluacion,
            }),
          );
          await titulosRepo.save(titulos);
        }
      }

      if (data.actividades_cientificas !== undefined) {
        const existingCientificas = await cientificasRepo.find({ where: { usuario: { rut } } });
        if (existingCientificas.length) await cientificasRepo.remove(existingCientificas);

        if (data.actividades_cientificas.length) {
          const cientificas = data.actividades_cientificas.map((a) =>
            cientificasRepo.create({
              usuario,
              nombre: a.nombre,
              descripcion: a.descripcion,
              periodo_participacion: a.periodo_participacion,
            }),
          );
          await cientificasRepo.save(cientificas);
        }
      }

      if (data.actividades_extracurriculares !== undefined) {
        const existingExtra = await extracurricularesRepo.find({ where: { usuario: { rut } } });
        if (existingExtra.length) await extracurricularesRepo.remove(existingExtra);

        if (data.actividades_extracurriculares.length) {
          const extra = data.actividades_extracurriculares.map((a) =>
            extracurricularesRepo.create({
              usuario,
              nombre: a.nombre,
              docente: a.docente,
              descripcion: a.descripcion,
              periodo_participacion: a.periodo_participacion,
            }),
          );
          await extracurricularesRepo.save(extra);
        }
      }

      // Devolver el curriculum actualizado (puedes ajustar para devolver relaciones si lo deseas)
      return existing;
    });
  }

  findAll() {
    return `This action returns all curriculum`;
  }

  async findOne(id: number) {
    
    return `This action returns a #${id} curriculum`;
  }

  

  async findByRut(rut: string) {
  const curriculum = await this.curriculumRepository.findOne({
    where: { usuario: { rut } },
    relations: [
      'usuario',
      'usuario.actividades_cientificas',
      'usuario.actividades_extracurriculares',
      'usuario.ayudantias',
      'usuario.titulos',
    ],
  });

  if (!curriculum) {
    return null;
  }

  return curriculum;
}
}
