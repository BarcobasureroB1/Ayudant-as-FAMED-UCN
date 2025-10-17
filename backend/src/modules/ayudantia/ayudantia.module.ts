import { Module } from '@nestjs/common';
import { AyudantiaService } from './ayudantia.service';
import { AyudantiaController } from './ayudantia.controller';

@Module({
  controllers: [AyudantiaController],
  providers: [AyudantiaService],
})
export class AyudantiaModule {}
