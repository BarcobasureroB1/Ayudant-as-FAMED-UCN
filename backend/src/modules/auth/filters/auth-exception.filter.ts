import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'ERROR_INTERNO';
    let message = 'Ha ocurrido un error inesperado';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
      }

      // Mapear códigos según el status
      switch (status) {
        case HttpStatus.NOT_FOUND:
          code = 'USUARIO_NO_ENCONTRADO';
          break;
        case HttpStatus.UNAUTHORIZED:
          code = 'CREDENCIALES_INVALIDAS';
          break;
        case HttpStatus.BAD_REQUEST:
          code = 'DATOS_INVALIDOS';
          break;
        case HttpStatus.CONFLICT:
          code = 'USUARIO_EXISTENTE';
          break;
        default:
          code = 'ERROR_AUTENTICACION';
      }
    } else if (exception instanceof Error) {
      // Errores genéricos lanzados con throw new Error()
      message = exception.message;

      // Mapear mensajes específicos a códigos
      if (message.includes('RUT inválido')) {
        status = HttpStatus.BAD_REQUEST;
        code = 'RUT_INVALIDO';
      } else if (message.includes('ya existe')) {
        status = HttpStatus.CONFLICT;
        code = 'USUARIO_EXISTENTE';
      } else if (message.includes('no encontrado') || message.includes('No se encontró')) {
        status = HttpStatus.NOT_FOUND;
        code = 'USUARIO_NO_ENCONTRADO';
      } else if (message.includes('no tiene data de alumno')) {
        status = HttpStatus.BAD_REQUEST;
        code = 'ALUMNO_NO_REGISTRADO';
      } else if (message.includes('correo')) {
        status = HttpStatus.BAD_REQUEST;
        code = 'CORREO_NO_ENCONTRADO';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        code = 'ERROR_AUTENTICACION';
      }
    }

    response.status(status).json({
      success: false,
      code,
      message,
      timestamp: new Date().toISOString(),
      path: ctx.getRequest().url,
    });
  }
}
