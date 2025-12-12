import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { Alumno } from '../alumno/entities/alumno.entity';


@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    @InjectRepository(Alumno)
    private alrepo : Repository<Alumno>
  ) {}

async create(createUsuarioDto: CreateUsuarioDto) {
  const usuario = await this.usuarioRepository.create({ ...createUsuarioDto, deshabilitado: false });
  return await this.usuarioRepository.save(usuario);
}

  findAll() {
    return this.usuarioRepository.find();
  }

  async findOne(rut: string): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOneBy({ rut });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    return usuario;

  }

  async findforLogin(rut: string) {
    return await this.usuarioRepository.findOneBy({ rut });
  }
  
  async findalumno(rut: string) {
    const usuario = await this.alrepo.findOneBy({ rut_alumno: rut });
    if (!usuario) {
      return null;
    }
    return usuario;
  }
  async guardar(usuario: Usuario) {
    return await this.usuarioRepository.save(usuario);
  }

  async findnivel(rut_alumno: string) {
    const alumno = await this.alrepo.findOneBy({ rut_alumno });
    if (!alumno) {
      return null;
    }
    const AlumnoData = { nivel: alumno.nivel,
      fecha_admision: alumno.fecha_admision
     };
    return AlumnoData;
  }

  async findcoordinadores() {
    // Devolver todos los usuarios cuyo `tipo` es 'coordinador',
    // incluso si todavía no tienen filas en la tabla `coordinador`.
    return await this.usuarioRepository.find({ where: { tipo: 'coordinador' } });
  }
  async cambiartipo(rut_usuario: string, nuevo_tipo: string) {
    const usuario = await this.usuarioRepository.findOneBy({ rut: rut_usuario  });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.tipo = nuevo_tipo;
    return await this.usuarioRepository.save(usuario);

  }
  async deshabilitarUsuario(rut_usuario: string) {
    const usuario = await this.usuarioRepository.findOneBy({ rut: rut_usuario  });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.deshabilitado = true;
    return await this.usuarioRepository.save(usuario);
  }

  async habilitarUsuario(rut_usuario: string) {
    const usuario = await this.usuarioRepository.findOneBy({ rut: rut_usuario  });
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }
    usuario.deshabilitado = false;
    return await this.usuarioRepository.save(usuario);
  }
}
