import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  UnauthorizedException,
} from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, Observable, of, switchMap } from 'rxjs';
import { RoleDecoratorParams, ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('AUTH-SERVICE') private readonly authService: ClientProxy,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // console.log(`[api][AuthGuard] start`);

    if (context.getType() !== 'http') {
      return false;
    }

    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      throw new HttpException(
        'Нет заголовка авторизации',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const authHeaderParts = (authHeader as string).split(' ');

    if (
      authHeaderParts.length !== 2 ||
      authHeaderParts[0].toLowerCase() != 'bearer'
    ) {
      // console.log('Неверный формат заголовка авторизации');
      throw new HttpException(
        'Неверный формат заголовка авторизации',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const jwt = authHeaderParts[1];
    // console.log(`JWT`)

    return this.authService.send({ cmd: 'verify-access-token' }, jwt).pipe(
      switchMap((value) => {
        // console.log(
        //   `[roles.guard]['verify-access-token' pipe] value: ${JSON.stringify(
        //     value,
        //   )}`,
        // );
        const { id, roles } = value as { id: number; roles: Array<any> };

        const { error } = value;

        if (error) {
          throw new HttpException(error, HttpStatus.UNAUTHORIZED);
        }

        request.user = { id, roles }; // Устанавливаем в реквест параметры которые могут пригодиться
        // console.log(
        //   `ROLES GUARD:\n\nrequest.user: ${JSON.stringify(request.user)}\n\n`,
        // );
        // Проверяем роли. Необходимость роли находится в метаданных гарда
        // Пытаемся достать метаданные из заголовка
        let roleParams = this.reflector.get<RoleDecoratorParams>(
          ROLES_KEY,
          context.getHandler(),
        );
        // Затем из класса
        if (!roleParams) {
          roleParams = this.reflector.get<RoleDecoratorParams>(
            ROLES_KEY,
            context.getClass(),
          );
        }

        // Если их нет, то гард проходит проверку (авторизация уже прошла)
        if (!roleParams) return of(true);

        // console.log(`[roles.guard] roleParams: ${JSON.stringify(roleParams)}`);

        // Как узнать, что пользователь собирается взять параметры о себе? Если мы договоримся, что
        // берем данные о пользователе только как параметры и что эти данные только email либо id.

        if (roleParams.allowSelf) {
          if (request.params['id'] == id) return of(true);
          // request.user = {email, id, roles};
          // return of(true);
        }

        // Считаем максимальный уровень доступа для пользователя (записываем его в реквест чтобы можно было в декораторе достать)

        request.userMaxPermission = Math.max(
          ...roles.map((role) => role.value),
        );

        if (request.userMaxPermission >= roleParams.minRoleVal) return of(true);

        // если с ролями не получилось, то выкидываем ошибку, которая будет сразу поймана парой строк дальше
        throw new HttpException('Недостаточно прав', HttpStatus.FORBIDDEN);
      }),
      catchError((error) => {
        if (error instanceof HttpException) throw error;
        throw new HttpException('Невалидный токен', HttpStatus.UNAUTHORIZED);
      }),
    );
  }
}
