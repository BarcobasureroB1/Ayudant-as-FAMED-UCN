import { Module } from '@nestjs/common';
import { AyudantiasCurriculumService } from './ayudantias_curriculum.service';
import { AyudantiasCurriculumController } from './ayudantias_curriculum.controller';

@Module({
  controllers: [AyudantiasCurriculumController],
  providers: [AyudantiasCurriculumService],
})
export class AyudantiasCurriculumModule {}
