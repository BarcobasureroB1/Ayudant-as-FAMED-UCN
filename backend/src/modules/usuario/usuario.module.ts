import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { Departamento } from '../departamento/entities/departamento.entity';
import { Alumno } from '../alumno/entities/alumno.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Departamento,Alumno])],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports: [UsuarioService],
})
export class UsuarioModule {}
