import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class ResetTokenGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromBody(request);

    if (!token) {
      throw new UnauthorizedException('Token de recuperación no proporcionado');
    }

    try {
      const payload = this.jwtService.verify(token);
      request.resetUser = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  private extractTokenFromBody(request: any): string | undefined {
    return request.body?.token;
  }
}
