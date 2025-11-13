import { Module } from '@nestjs/common';
import { CoordinadorService } from './coordinador.service';
import { CoordinadorController } from './coordinador.controller';
import { Coordinador } from './entities/coordinador.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Coordinador,Usuario,Asignatura])],
  controllers: [CoordinadorController],
  providers: [CoordinadorService],
})
export class CoordinadorModule {}
