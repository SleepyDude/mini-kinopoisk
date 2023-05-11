import { Catch, RpcExceptionFilter } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class ExceptionFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException): Observable<any> {
    console.log(
      `[auth][ExceptionFilter] catch exception: ${JSON.stringify(exception)}`,
    );
    return throwError(() => exception);
  }
}
