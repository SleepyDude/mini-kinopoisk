import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomHttpExceptionResponse } from './http.exceptions.response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let errorMessage: string | object;

    if (exception instanceof HttpException) {
      // console.log(`Получена ошибка HttpException:\n\n${JSON.stringify(exception)}\n\n`);
      status = exception.getStatus();
      errorMessage = exception.getResponse();
      if (typeof errorMessage == 'object') {
        const { validation_message } = errorMessage as {
          validation_message: object;
        };
        if (validation_message) {
          // имеем ошибку валидации
          errorMessage = validation_message;
        }

        const { message } = errorMessage as { message: string };
        if (message) {
          // для обработки встроенных пайпов в валидации, например @Param('id', ParseIntPipe)
          errorMessage = message;
        }
      }
    } else {
      // console.log(`Получена ошибка отличная от HttpException:\n\n${JSON.stringify(exception)}\n\n`);
      const { message, statusCode } = exception as {
        message: string;
        statusCode: number;
      };
      if (message) {
        errorMessage = message;
      } else {
        errorMessage = 'Произошла неизвестная ошибка отличная от HttpException';
      }

      if (statusCode) {
        status = statusCode;
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    const errorResponse = this.getErrorResponse(status, errorMessage, request);
    // this.logError(errorResponse, request, exception);
    response.status(status).json(errorResponse);
  }

  private getErrorResponse = (
    status: HttpStatus,
    errorMessage: string | object,
    request: Request,
  ): CustomHttpExceptionResponse => ({
    statusCode: status,
    error: errorMessage,
    path: request.url,
    method: request.method,
    timeStamp: new Date(),
  });

  private logError(
    errorResponse: CustomHttpExceptionResponse,
    request: Request,
    exception: unknown,
  ): void {
    const { statusCode, error } = errorResponse;
    const { method, url } = request;
    const errorLog = `Response Code: ${statusCode} - Method: ${method} - URL: ${url}\n\n
        ${JSON.stringify(errorResponse)}\n\n
        ${exception instanceof HttpException ? exception.stack : error}\n\n`;
    console.log(7, errorLog);
  }
}
