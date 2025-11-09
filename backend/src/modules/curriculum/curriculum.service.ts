import { Injectable } from '@nestjs/common';
import { CreateCurriculumDto } from './dto/create-curriculum.dto';
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
    const alumno = await this.alumnoRepository.findOneBy({ rut_alumno: data.rut_alumno });
    if (!alumno) {
      throw new Error('Alumno no encontrado');
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
          alumno,
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
              alumno,
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
              alumno,
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
              alumno,
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
              alumno,
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

  findAll() {
    return `This action returns all curriculum`;
  }

  async findOne(id: number) {
    
    return `This action returns a #${id} curriculum`;
  }

  update(id: number) {
    return `This action updates a #${id} curriculum`;
  }

  async findByRut(rut_alumno: string) {
  const curriculum = await this.curriculumRepository.findOne({
    where: { alumno: { rut_alumno } },
    relations: [
      'alumno',
      'alumno.actividades_cientificas',
      'alumno.actividades_extracurriculares',
      'alumno.ayudantias',
      'alumno.titulos',
    ],
  });

  if (!curriculum) {
    return null;
  }

  return curriculum;
}
}
