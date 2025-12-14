import { Module } from '@nestjs/common';
import { getEnvValue } from './config/config.service';
import { TypeOrmModule
} from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { ActaModule } from './modules/acta/acta.module';
import { ActividadesCientificasModule } from './modules/actividades_cientificas/actividades_cientificas.module';
import { ActividadesExtracurricularesModule } from './modules/actividades_extracurriculares/actividades_extracurriculares.module';
import { AsignaturaModule } from './modules/asignatura/asignatura.module';
import { AyudantiaModule } from './modules/ayudantia/ayudantia.module';
import { AyudantiasCurriculumModule } from './modules/ayudantias_curriculum/ayudantias_curriculum.module';
import { ConsanguineoModule } from './modules/consanguineo/consanguineo.module';
import { CoordinadorModule } from './modules/coordinador/coordinador.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { DepartamentoModule } from './modules/departamento/departamento.module';
import { FirmasActaModule } from './modules/firmas_acta/firmas_acta.module';
import { ParticipantesActaModule } from './modules/participantes_acta/participantes_acta.module';
import { PostulacionModule } from './modules/postulacion/postulacion.module';
import { TitulosCursosModule } from './modules/titulos_cursos/titulos_cursos.module';
import { AuthModule } from './modules/auth/auth.module';
import { AlumnoModule } from './modules/alumno/alumno.module';
import { LlamadoPostulacionModule } from './modules/llamado_postulacion/llamado_postulacion.module';
import { AsignaturaAlumnoModule } from './modules/asignatura_alumno/asignatura_alumno.module';
import { EmailModule } from './modules/email/email.module';





@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: getEnvValue('DATABASE_HOST'),
      port: +getEnvValue('DATABASE_PORT'),
      username: getEnvValue('DATABASE_USERNAME'),
      password: getEnvValue('DATABASE_PASSWORD'),
      database: getEnvValue('DATABASE_NAME'),
      synchronize: true,
    autoLoadEntities: true,
    }),
    UsuarioModule,
    ActaModule,
    ActividadesCientificasModule,
    ActividadesExtracurricularesModule,
    AsignaturaModule,
    AyudantiaModule,
    AyudantiasCurriculumModule,
    ConsanguineoModule,
    CoordinadorModule,
    CurriculumModule,
    DepartamentoModule,
    FirmasActaModule,
    ParticipantesActaModule,
    PostulacionModule,
    TitulosCursosModule,
    AuthModule,
    AlumnoModule,
    LlamadoPostulacionModule,
    AsignaturaAlumnoModule,
    EmailModule,
    



  ],
      
  controllers: [],
  providers: [],
})
export class AppModule {}
