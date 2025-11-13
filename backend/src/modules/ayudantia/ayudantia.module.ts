import { Module } from '@nestjs/common';
import { AyudantiaService } from './ayudantia.service';
import { AyudantiaController } from './ayudantia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ayudantia } from './entities/ayudantia.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Coordinador } from '../coordinador/entities/coordinador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ayudantia,Asignatura, Usuario, Coordinador])],
  controllers: [AyudantiaController],
  providers: [AyudantiaService],
})
export class AyudantiaModule {}
