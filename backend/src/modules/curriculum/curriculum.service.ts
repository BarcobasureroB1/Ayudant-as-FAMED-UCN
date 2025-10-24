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
  ) {}

  async create(data: CreateCurriculumDto) {
    const usuario = await this.usuarioService.findOne(data.rut_alumno);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    const curriculum = this.curriculumRepository.create({
      usuario,
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
    await this.curriculumRepository.save(curriculum);

    const rut = data.rut_alumno;

    if (data.ayudantias?.length) {
      console.log('Ayudantias data:', data.ayudantias);
      const ayudantias = data.ayudantias.map((a) =>
        this.ayudantiasCurriculumRepository.create({
          usuario,
          nombre_asig: a.nombre_asig,
          nombre_coordinador: a.nombre_coordinador,
          evaluacion: a.evaluacion_obtenida
        }),
      );
      await this.ayudantiasCurriculumRepository.save(ayudantias);
    }

   if (data.cursos_titulos_grados?.length) {
      const titulos = data.cursos_titulos_grados.map((c) =>
        this.titulosCursoRepository.create({
          usuario,
          nombre_asig: c.nombre_asig,
          n_coordinador: c.n_coordinador,
          evaluacion: c.evaluacion,
        }),
      );
      await this.titulosCursoRepository.save(titulos);
    }
     if (data.actividades_cientificas?.length) {
      const cientificas = data.actividades_cientificas.map((a) =>
        this.actividadesCientificaRepository.create({
          usuario,
          nombre: a.nombre,
          descripcion: a.descripcion,
          periodo_participacion: a.periodo_participacion,
        }),
      );
      await this.actividadesCientificaRepository.save(cientificas);
    }
    if (data.actividades_extracurriculares?.length) {
      const extra = data.actividades_extracurriculares.map((a) =>
        this.actividadesExtracurriculareRepository.create({
          usuario,
          nombre: a.nombre,
          docente: a.docente,
          descripcion: a.descripcion,
          periodo_participacion: a.periodo_participacion,
        }),
      );
      await this.actividadesExtracurriculareRepository.save(extra);
    }
   

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
