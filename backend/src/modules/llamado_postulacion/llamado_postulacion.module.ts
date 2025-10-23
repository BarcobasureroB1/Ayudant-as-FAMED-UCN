import { Module } from '@nestjs/common';
import { LlamadoPostulacionService } from './llamado_postulacion.service';
import { LlamadoPostulacionController } from './llamado_postulacion.controller';

@Module({
  controllers: [LlamadoPostulacionController],
  providers: [LlamadoPostulacionService],
})
export class LlamadoPostulacionModule {}
