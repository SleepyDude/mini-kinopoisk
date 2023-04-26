import { Controller, UseFilters } from '@nestjs/common';
import { UsersService } from './users.service';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { CreateUserDto } from './dto/create-user.dto';
import { AddRoleDto, AddRoleDtoEmail } from './dto/add-role.dto';

// import { DtoValidationPipe, HttpExceptionFilter, ObservableExceptionFilter, SharedService, UserPermission } from 'y/shared';
// import { AddRoleDtoEmail, CreateUserDto } from 'y/shared/dto';

// @UsePipes(ValidationPipe)
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

    @MessagePattern({ cmd: 'create-user' })
    async createUser(
        @Payload() dto: CreateUserDto,
    ) {
        return await this.usersService.createUser(dto);
    }

    // @UseFilters(new HttpExceptionFilter())
    @MessagePattern({ cmd: 'add-role-to-user-by-email' })
    async addRoleByEmail(
        // @Ctx() context: RmqContext,
        @Payload() dto: AddRoleDtoEmail
    ) {
        console.log(`[users.controller][add-role-to-user-by-email] +`);
        // this.sharedService.acknowledgeMessage(context);

        return await this.usersService.addRoleByEmail(dto);
    }

    @MessagePattern({ cmd: 'add-role-to-user-by-id' })
    async addRoleById(
        // @Ctx() context: RmqContext,
        @Payload() dto: AddRoleDto,
    ) {
        console.log(`[users.controller][add-role-to-user-by-email] +`);
        // this.sharedService.acknowledgeMessage(context);

        return await this.usersService.addRole(dto);
    }
}