import { HttpStatus, Injectable } from '@nestjs/common';
import { initRoles } from './init.roles';
import { RolesService } from 'src/roles/roles.service';
import { UsersService } from 'src/users/users.service';
import { HttpRpcException } from '@hotels2023nestjs/shared';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class InitService {
  constructor(
    private roleService: RolesService,
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  async createAdminAndRoles(): Promise<boolean> {
    // Метод должен быть вызван только единожды, поэтому проверяем, есть ли уже роль OWNER и как следствие главный админ
    const ownerRole = await this.roleService.getRoleByName('OWNER');
    if (ownerRole) {
      throw new HttpRpcException(
        'Инициализация уже была выполнена, невозможен повторный вызов',
        HttpStatus.FORBIDDEN,
      );
    }

    // Проверка на наличие переменных окружения
    if (
      process.env.OWNER_MAIL === undefined ||
      process.env.OWNER_PASSWORD === undefined
    ) {
      throw new HttpRpcException(
        'Ошибка инициализации, не найдены переменные среды OWNER_MAIL и OWNER_PASSWORD',
        HttpStatus.NOT_FOUND,
      );
    }

    // Создаём 3 базовые роли - USER, ADMIN и OWNER
    await this.roleService.createRole(initRoles['ADMIN']);
    await this.roleService.createRole(initRoles['OWNER']);
    await this.roleService.createRole(initRoles['USER']);

    // Зарегистрируем владельца ресурса
    const loginDto = {
      email: process.env.OWNER_MAIL,
      password: process.env.OWNER_PASSWORD,
    };
    await this.authService.registration(loginDto);
    // const hashedPassword = await bcrypt.hash( process.env.OWNER_PASSWORD, +process.env.SALT );
    // const tokens = await this.userService.createUser({email: process.env.OWNER_MAIL, password: hashedPassword});

    // Присвоим владельцу ресурса соответствующую роль
    await this.userService.addRoleByEmail({
      email: process.env.OWNER_MAIL,
      roleName: initRoles.OWNER.name,
    });

    return true;
  }
}
