import { Module } from '@nestjs/common';
import { FirmasActaService } from './firmas_acta.service';
import { FirmasActaController } from './firmas_acta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirmasActa } from './entities/firmas_acta.entity';
@Module({
  imports: [TypeOrmModule.forFeature([FirmasActa])],
  controllers: [FirmasActaController],
  providers: [FirmasActaService],
})
export class FirmasActaModule {}
