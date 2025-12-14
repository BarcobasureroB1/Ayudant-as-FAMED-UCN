import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants/jwt.constant';

import { UsuarioModule } from '../usuario/usuario.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuario/entities/usuario.entity';
import { AlumnoModule } from '../alumno/alumno.module';
import { Alumno } from '../alumno/entities/alumno.entity';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario,Alumno])
    ,UsuarioModule,AlumnoModule,EmailModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '1d' }, // Token expiration time
    })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
