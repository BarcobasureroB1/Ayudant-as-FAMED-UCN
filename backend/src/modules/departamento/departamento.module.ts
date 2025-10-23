import { Module } from '@nestjs/common';
import { DepartamentoService } from './departamento.service';
import { DepartamentoController } from './departamento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Departamento } from './entities/departamento.entity';
import { Usuario } from '../usuario/entities/usuario.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Departamento,Usuario])],
  controllers: [DepartamentoController],
  providers: [DepartamentoService],
  exports: [DepartamentoService]
})
export class DepartamentoModule {}
