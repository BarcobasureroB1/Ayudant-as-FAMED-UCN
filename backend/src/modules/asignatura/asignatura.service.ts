import { Injectable } from '@nestjs/common';
import { CreateAsignaturaDto } from './dto/create-asignatura.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asignatura } from './entities/asignatura.entity';
import { Departamento } from '../departamento/entities/departamento.entity';
import { UsuarioService } from '../usuario/usuario.service';


@Injectable()
export class AsignaturaService {
  constructor( 
    @InjectRepository(Asignatura)
    private readonly asignaturaRepository: Repository<Asignatura>,
    @InjectRepository(Departamento)
    private readonly depa: Repository<Departamento>,
    private readonly depaservice: UsuarioService
  ) {}
  async create(createAsignaturaDto: CreateAsignaturaDto) {
    const departamento = await this.depa.findOne({ where: { nombre: createAsignaturaDto.Departamento } });
    if (!departamento) {
      return null;
    }
    const asignatura = new Asignatura();
    asignatura.nombre = createAsignaturaDto.nombre;
    asignatura.nrc = createAsignaturaDto.nrc;
    asignatura.semestre = createAsignaturaDto.semestre;
    // ManyToMany relation expects an array of departamentos
    asignatura.departamentos = [departamento];

    return await this.asignaturaRepository.save(asignatura);
  }

  async findAvaibleAsignaturas(rut_alumno) {
    return null ;
  }
  async findAll() {
    return await this.asignaturaRepository.find();
  }

}
