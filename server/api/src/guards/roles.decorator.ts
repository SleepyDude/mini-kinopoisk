import { SetMetadata } from '@nestjs/common';

export interface RoleDecoratorParams {
  minRoleVal: number; // Минимальное значение для доли
  allowSelf?: boolean; // Давать ли доступ самому пользователю безотносительно роли
}

export const ROLES_KEY = 'roles';

export const RoleAccess = (params: RoleDecoratorParams | number) =>
  SetMetadata(
    ROLES_KEY,
    typeof params == 'number' ? { minRoleVal: params } : params,
  );
