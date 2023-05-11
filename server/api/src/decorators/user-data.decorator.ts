import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// можно через декоратор получить id пользователя, который делает запрос след. образом:
// @UserData('id') id: number
export const UserData = createParamDecorator(
  (data: 'id' | 'permission', ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data === 'permission') {
      return request.userMaxPermission;
    }
    // console.log(`request.user: ${JSON.stringify(request.user)}`);
    return request.user[data];
  },
);
