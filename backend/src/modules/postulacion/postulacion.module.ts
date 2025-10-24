import { Module } from '@nestjs/common';
import { PostulacionService } from './postulacion.service';
import { PostulacionController } from './postulacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postulacion } from './entities/postulacion.entity';
import { Ayudantia } from '../ayudantia/entities/ayudantia.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Postulacion, Asignatura, Usuario])],
  controllers: [PostulacionController],
  providers: [PostulacionService],
})
export class PostulacionModule {}
