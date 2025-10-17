import { Module } from '@nestjs/common';
import { FirmasActaService } from './firmas_acta.service';
import { FirmasActaController } from './firmas_acta.controller';

@Module({
  controllers: [FirmasActaController],
  providers: [FirmasActaService],
})
export class FirmasActaModule {}
