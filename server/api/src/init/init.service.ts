import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { catchError, firstValueFrom, map, throwError } from 'rxjs';
import { InitDto } from './dto/init.dto';
import { initRoles } from './init.roles';

@Injectable()
export class InitService {

    constructor(
        @Inject('USERS-SERVICE') private usersService: ClientProxy,
        @Inject('AUTH-SERVICE')  private authService: ClientProxy,
    ) {}

    async createAdminAndRoles(initDto: InitDto): Promise<{refreshToken: string, accessToken: string}> {
        // Метод должен быть вызван только единожды, поэтому проверяем, есть ли уже роль OWNER и как следствие главный админ
        const ownerRole = await firstValueFrom(this.usersService.send({ cmd: 'get-role-by-name' }, 'OWNER').pipe(
            map((value) => {
                // console.log(`[init] got value: ${JSON.stringify(value)}`);
                return value;
            }),
            // rpcToHttp()
        ));

        // console.log(`[init.service][init] ownerRole: ${JSON.stringify(ownerRole)}`);
        if (ownerRole) {
            throw new HttpException('Инициализация уже была выполнена, невозможен повторный вызов', HttpStatus.FORBIDDEN);
        }

        // Создаём 3 базовые роли - USER, ADMIN и OWNER
        // console.log(`before USER creation`)
        await firstValueFrom(this.usersService.send({ cmd: 'create-role' }, {dto: initRoles['USER']} ));
        // console.log(`before ADMIN creation`)
        await firstValueFrom(this.usersService.send({ cmd: 'create-role' }, {dto: initRoles['ADMIN']} ));
        // console.log(`before OWNER creation`)    
        await firstValueFrom(this.usersService.send({ cmd: 'create-role' }, {dto: initRoles['OWNER']} ));

        // Зарегистрируем владельца ресурса
        const tokens = await firstValueFrom(this.authService.send({ cmd: 'registration' }, initDto).pipe(
            map( (val) => {
                return val;
            }),
            catchError(val => {
                // Удалю созданные роли
                this.usersService.send({ cmd: 'delete-role-by-name' }, {name: initRoles['USER'] });
                this.usersService.send({ cmd: 'delete-role-by-name' }, {name: initRoles['ADMIN']});
                this.usersService.send({ cmd: 'delete-role-by-name' }, {name: initRoles['OWNER']});

                return throwError( () => new HttpException(val.message, HttpStatus.BAD_REQUEST));
            })
        ));
        
        // Присвоим владельцу ресурса соответствующую роль
        await firstValueFrom(this.usersService.send({ cmd: 'add-role-to-user-by-email' }, {email: initDto.email, roleName: initRoles.OWNER.name}));
        
        // старый токен уже ее не содержит, обновим
        const { accessToken, newRefreshToken } = await firstValueFrom( this.authService.send({cmd: 'refresh'}, tokens.refreshToken) );

        return { accessToken, refreshToken: newRefreshToken };
    }
}
