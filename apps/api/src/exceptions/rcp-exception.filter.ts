import {
  Catch,
  RpcExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException): Observable<any> {
    return throwError(
      () => new HttpException(exception.message, HttpStatus.BAD_REQUEST),
    );
  }
}
