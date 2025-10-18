import { Module } from '@nestjs/common';
import { AyudantiaService } from './ayudantia.service';
import { AyudantiaController } from './ayudantia.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ayudantia } from './entities/ayudantia.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ayudantia])],
  controllers: [AyudantiaController],
  providers: [AyudantiaService],
})
export class AyudantiaModule {}
