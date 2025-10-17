import { Module } from '@nestjs/common';
import { ConsanguineoService } from './consanguineo.service';
import { ConsanguineoController } from './consanguineo.controller';

@Module({
  controllers: [ConsanguineoController],
  providers: [ConsanguineoService],
})
export class ConsanguineoModule {}
