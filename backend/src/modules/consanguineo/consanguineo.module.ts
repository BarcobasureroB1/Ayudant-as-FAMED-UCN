import { Module } from '@nestjs/common';
import { ConsanguineoService } from './consanguineo.service';
import { ConsanguineoController } from './consanguineo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Consanguineo } from './entities/consanguineo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Consanguineo]) ],
  controllers: [ConsanguineoController],
  providers: [ConsanguineoService],
})
export class ConsanguineoModule {}
