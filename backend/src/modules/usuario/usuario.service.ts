import { Injectable } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';


@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
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
    const usuario = await this.usuarioRepository.findOneBy({ rut, tipo: 'alumno' });
    if (!usuario) {
      return null;
    }
    return usuario;
  }
  async guardar(usuario: Usuario) {
    return await this.usuarioRepository.save(usuario);
  }
  




}
