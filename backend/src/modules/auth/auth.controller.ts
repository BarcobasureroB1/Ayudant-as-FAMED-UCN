import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/LoginDto';
import { AuthGuard } from './guards/aurh.guard';



@Controller('auth')
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
}
