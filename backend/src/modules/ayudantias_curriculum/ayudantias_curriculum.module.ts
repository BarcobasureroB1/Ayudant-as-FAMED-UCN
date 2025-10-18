import { Module } from '@nestjs/common';
import { AyudantiasCurriculumService } from './ayudantias_curriculum.service';
import { AyudantiasCurriculumController } from './ayudantias_curriculum.controller';
import { AyudantiasCurriculum } from './entities/ayudantias_curriculum.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([AyudantiasCurriculum])],
  controllers: [AyudantiasCurriculumController],
  providers: [AyudantiasCurriculumService],
})
export class AyudantiasCurriculumModule {}
