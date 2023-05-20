import { HttpStatus, Injectable } from '@nestjs/common';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { HttpRpcException, initRoles } from '@shared';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class InitService {
  constructor(
    private roleService: RolesService,
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  async createAdminAndRoles(): Promise<boolean> {
    const ownerRole = await this.roleService.getRoleByName('OWNER');
    if (ownerRole) {
      throw new HttpRpcException(
        'Инициализация уже была выполнена, невозможен повторный вызов',
        HttpStatus.FORBIDDEN,
      );
    }

    if (
      process.env.OWNER_MAIL === undefined ||
      process.env.OWNER_PASSWORD === undefined
    ) {
      throw new HttpRpcException(
        'Ошибка инициализации, не найдены переменные среды OWNER_MAIL и OWNER_PASSWORD',
        HttpStatus.NOT_FOUND,
      );
    }

    await this.roleService.createRole(initRoles['ADMIN']);
    await this.roleService.createRole(initRoles['OWNER']);
    await this.roleService.createRole(initRoles['USER']);

    await this.authService.registration({
      email: process.env.OWNER_MAIL,
      password: process.env.OWNER_PASSWORD,
    });

    await this.userService.addRoleByEmail({
      email: process.env.OWNER_MAIL,
      roleName: initRoles.OWNER.name,
    });

    return true;
  }
}
