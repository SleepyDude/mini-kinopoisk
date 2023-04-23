import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, map, of, switchMap, throwError } from 'rxjs';
import { rpcToHttp } from 'src/filters/proxy.error';
import { InitDto } from './dto/init.dto';
import { initRoles } from './init.roles';

@Injectable()
export class InitService {

    constructor(
        @Inject('USERS-SERVICE') private usersService: ClientProxy,
    ) {}

    async createAdminAndRoles(initDto: InitDto) {
        // Метод должен быть вызван только единожды, поэтому проверяем, есть ли уже роль OWNER и как следствие главный админ
        const ownerRole = await firstValueFrom(this.usersService.send({ cmd: 'get-role-by-name' }, 'OWNER').pipe(
            map((value) => {
                return value;
            }),
            rpcToHttp()
        ));

        console.log(`[init.service][init] ownerRole: ${JSON.stringify(ownerRole)}`);
        if (ownerRole) {
            throw new HttpException('Инициализация уже была выполнена, невозможен повторный вызов', HttpStatus.FORBIDDEN);
        }

        // Создаём 3 базовые роли - USER, ADMIN и OWNER
        console.log(`before USER creation`)
        await firstValueFrom(this.usersService.send({ cmd: 'create-role' }, initRoles['USER']));
        console.log(`before ADMIN creation`)
        await firstValueFrom(this.usersService.send({ cmd: 'create-role' }, initRoles['ADMIN']));
        console.log(`before OWNER creation`)
        await firstValueFrom(this.usersService.send({ cmd: 'create-role' }, initRoles['OWNER']));

        // Зарегистрируем владельца ресурса

        // // TODO - обращение к микросервису авторизации

        // const {id} = await this.authService.register({
        //     email: initDto.email,
        //     password: initDto.password,
        // })
        // // Пока что без модуля авторизации буду просто создавать пользователя
        const id = await firstValueFrom(this.usersService.send({ cmd: 'create-user' }, initDto).pipe(
            catchError(val => {
                // Удалю созданные роли
                this.usersService.send({ cmd: 'delete-role-by-name' }, {name: initRoles['USER'] });
                this.usersService.send({ cmd: 'delete-role-by-name' }, {name: initRoles['ADMIN']});
                this.usersService.send({ cmd: 'delete-role-by-name' }, {name: initRoles['OWNER']});

                return throwError( () => new HttpException(val.message, HttpStatus.BAD_REQUEST));
            })
        ));
        
        console.log(`got from create user, id: ${JSON.stringify(id)}`);
        
        // // Присвоим владельцу ресурса соответствующую роль
        await firstValueFrom(this.usersService.send({ cmd: 'add-role-to-user-by-id' }, {userId: id, roleName: initRoles.OWNER.name}));
        return {"message": "Администратор ресурса и базовые роли созданы успешно, наслаждайтесь."};
    }
}
