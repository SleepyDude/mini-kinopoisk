import { Controller, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { AddRoleDtoEmail } from './dto/add-role.dto';

// import { DtoValidationPipe, HttpExceptionFilter, ObservableExceptionFilter, SharedService, UserPermission } from 'y/shared';
// import { AddRoleDtoEmail, CreateUserDto } from 'y/shared/dto';

// @UsePipes(ValidationPipe)
// @ApiTags('Пользователи')
@Controller('users')
export class UsersController {

    constructor(
        private usersService: UsersService,
        // private readonly sharedService: SharedService,
    ) {}

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'get-user-by-email' })
    async getUser(
        // @Ctx() context: RmqContext,
        @Payload() email: string,
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        return await this.usersService.getUserByEmail(email); 
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'get-user-by-id' })
    async getUserById(
        // @Ctx() context: RmqContext,
        @Payload() id: number,
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][getUserByEmail] email: ${JSON.stringify(email)}`);

        return await this.usersService.getUserById(id); 
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'create-user' })
    async createUser(
        // @Ctx() context: RmqContext,
        @Payload() dto: CreateUserDto,
    ) {
        // this.sharedService.acknowledgeMessage(context);
        // console.log(`[auth][users.controller][createUser] +`);

        return await this.usersService.createUser(dto);
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'add-role-to-user' })
    async addRole(
        // @Ctx() context: RmqContext,
        @Payload() dto: AddRoleDtoEmail,
    ) {
        // this.sharedService.acknowledgeMessage(context);

        return await this.usersService.addRoleByEmail(dto);
    }
}
