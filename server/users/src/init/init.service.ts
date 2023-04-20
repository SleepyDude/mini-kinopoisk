import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { AuthService } from '../auth.service';
import { RolesService } from '../roles/roles.service';
import { UsersService } from '../users/users.service';
import { InitDto } from './dto/init.dto';
import { initRoles } from './init.roles';
// import { initRoles } from 'y/shared';

@Injectable()
export class InitService {

    constructor(private roleService: RolesService,
                // private authService: AuthService,
                private userService: UsersService ) {}

    async createAdminAndRoles(initDto: InitDto) {
        // Метод должен быть вызван только единожды, поэтому проверяем, есть ли уже роль OWNER и как следствие главный админ
        const hasOwner = await this.roleService.getRoleByName(initRoles['OWNER'].name);
        if (hasOwner) {
            throw new HttpException('Инициализация уже была выполнена, невозможен повторный вызов', HttpStatus.FORBIDDEN);
        }
        // Создаём 3 базовые роли - USER, ADMIN и OWNER
        await this.roleService.createRole(initRoles['USER']);
        await this.roleService.createRole(initRoles['ADMIN']);
        await this.roleService.createRole(initRoles['OWNER']);
        // Зарегистрируем владельца ресурса

        // TODO - обращение к микросервису авторизации

        // const {id} = await this.authService.register({
        //     email: initDto.email,
        //     password: initDto.password,
        // })
        // Пока что без модуля авторизации буду просто создавать пользователя
        await this.userService.createUser(initDto);
        const id = 1;
        // Присвоим владельцу ресурса соответствующую роль
        await this.userService.addRole({userId: id, roleName: initRoles['OWNER'].name});
        return {"message": "Администратор ресурса и базовые роли созданы успешно, наслаждайтесь."};
    }
}
