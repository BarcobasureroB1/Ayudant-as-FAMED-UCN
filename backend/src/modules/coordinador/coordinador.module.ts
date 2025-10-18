import { Module } from '@nestjs/common';
import { CoordinadorService } from './coordinador.service';
import { CoordinadorController } from './coordinador.controller';
import { Coordinador } from './entities/coordinador.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [TypeOrmModule.forFeature([Coordinador])],
  controllers: [CoordinadorController],
  providers: [CoordinadorService],
})
export class CoordinadorModule {}
