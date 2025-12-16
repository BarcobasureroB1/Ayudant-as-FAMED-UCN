import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, UseFilters } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { AuthGuard } from './guards/aurh.guard';
import { ResetTokenGuard } from './guards/reset-token.guard';
import { RegisterDto } from './dto/RegisterDto';
import { AuthExceptionFilter } from './filters/auth-exception.filter';



@Controller('auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}
   @Post('login')
    login(@Body()
    loginDto: LoginDto,) { 
        return this.authService.login(loginDto);
      }

  @Get('profile')
    @UseGuards(AuthGuard)
    profile(
        @Request() req
    ) {
     return req.user; 
    }
    @Post('register')
    register(@Body()
    registerDto:RegisterDto) {
        
        return this.authService.Register(registerDto); 
    }

    @Post('recuperar-contrasena')
    recuperarContrasena(@Body() body: { rut: string }) {
      return this.authService.enviarRecuperacionContrasena(body.rut);
    }

    @Post('restablecer-contrasena')
    @UseGuards(ResetTokenGuard)
    restablecerContrasena(@Body() body: { token: string; nuevaContrasena: string }, @Request() req) {
      return this.authService.restablecerContrasena(req.resetUser.rut, body.nuevaContrasena);
    }
}
