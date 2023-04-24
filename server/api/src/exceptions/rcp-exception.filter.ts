import { Catch, RpcExceptionFilter, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    // console.log(`[auth][ExceptionFilter] catch exception: ${JSON.stringify(exception)}`);
    return throwError( () => new HttpException(exception.message, HttpStatus.BAD_REQUEST));
  }
}