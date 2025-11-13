import { Injectable } from '@nestjs/common';
import { CreateAyudantiaDto } from './dto/create-ayudantia.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ayudantia } from './entities/ayudantia.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';


@Injectable()
export class AyudantiaService {
  constructor(
    @InjectRepository(Ayudantia)
    private readonly ayudantiaRepository: Repository<Ayudantia>,
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Coordinador)
    private readonly coordinadorRepository: Repository<Coordinador>,
  ) {}

  async create(dto:CreateAyudantiaDto){
    const asignatura = await this.asignaturaRepository.findOneBy({ id: dto.id_asignatura });
    if (!asignatura) {
      return null;
    }
    const alumno = await this.usuarioRepository.findOneBy({ rut: dto.rut_alumno });
    if (!alumno) {
      return null;
    }
    const coordinador = await this.usuarioRepository.findOneBy({ rut: dto.rut_coordinador_otro });
    if (!coordinador) {
      return null;
    }
    
    const entity = this.ayudantiaRepository.create({
      alumno,
      asignatura,
      evaluacion: dto.evaluacion,
      coordinador,
      periodo: dto.periodo,
      remunerada: dto.remunerada,
      tipo_ayudantia: dto.tipo_ayudantia,
    });

    // Persistir la entidad en la base de datos y devolver la entidad guardada.
    return await this.ayudantiaRepository.save(entity);
  }

  async findByUsuario(rut: string) {
    console.log('Finding ayudantias for rut:', rut);
    const ayudantias = await this.ayudantiaRepository
      .createQueryBuilder('ayudantia')
      .leftJoinAndSelect('ayudantia.alumno', 'alumno')
      .leftJoinAndSelect('ayudantia.asignatura', 'asignatura')
      .leftJoinAndSelect('ayudantia.coordinador', 'coordinador')
      // Filtrar por la columna física en la tabla `ayudantia` para cubrir
      // ambos roles: alumno o coordinador.
      .where('ayudantia.rut_alumno = :rut OR ayudantia.rut_coordinador_otro = :rut', { rut })
      .getMany();

    return ayudantias;
  }
}
