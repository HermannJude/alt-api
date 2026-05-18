// src/common/filters/prisma-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { Prisma } from 'generated/prisma/client';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = `Resource already exists with the provided unique value.`;
        break;

      case 'P2003':
        status = HttpStatus.BAD_REQUEST;
        message = `The provided relation values are invalid (parent ID not found).`;
        break;

      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = `Resource not found`;
        break;

      case 'P2001':
        status = HttpStatus.NOT_FOUND;
        message = `The required resource does not exist`;
        break;

      default:
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = `Unhandled database error: ${exception.code}`;
        break;
    }

    console.error(`[Prisma Error ${exception.code}]: ${exception.message}`);

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}
