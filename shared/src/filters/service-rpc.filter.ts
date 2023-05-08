import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class ServiceRpcFilter implements RpcExceptionFilter<RpcException> {
  catch(exception: RpcException, host: ArgumentsHost): Observable<any> {
    console.log(`[shared][ServiceRpcFilter] catch exception: ${JSON.stringify(exception)}`);
    return throwError(() => exception);
  }
}