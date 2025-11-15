import { Module } from '@nestjs/common';
import { LlamadoPostulacionService } from './llamado_postulacion.service';
import { LlamadoPostulacionController } from './llamado_postulacion.controller';
import { Asignatura } from '../asignatura/entities/asignatura.entity';
import { Usuario } from '../usuario/entities/usuario.entity';
import { LlamadoPostulacion } from './entities/llamado_postulacion.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forFeature([LlamadoPostulacion, Usuario, Asignatura]),
  ],
  controllers: [LlamadoPostulacionController],
  providers: [LlamadoPostulacionService],
})
export class LlamadoPostulacionModule {}
