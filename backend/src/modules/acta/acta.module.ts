import { Module } from '@nestjs/common';
import { ActaService } from './acta.service';
import { ActaController } from './acta.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Acta } from './entities/acta.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Acta])],
  controllers: [ActaController],
  providers: [ActaService],
})
export class ActaModule {}
