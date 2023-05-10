import { Body, Controller, Get, Inject, Param, ParseIntPipe, Put, UseFilters, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { ClientProxy } from '@nestjs/microservices';
import { UpdateProfileDto } from '@hotels2023nestjs/shared';
import { RolesGuard } from '../guards/roles.guard';
import { RoleAccess } from '../guards/roles.decorator';
import { initRoles } from '../guards/init.roles';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с профилем пользователя')
@Controller('profiles')
export class ProfilesController {

    constructor(
        @Inject('SOCIAL-SERVICE') private socialService: ClientProxy,
    ) {}

    @UseGuards(RolesGuard)
    @RoleAccess({ minRoleVal: initRoles.ADMIN.value, allowSelf: true })
    @ApiOperation({ summary: 'Получение профиля по id' })
    @ApiResponse({ status: 200, description: 'Профиль пользователя с данным <id>, доступ у самого пользователя и администратора' })
    @Get(':id')
    async getProfileByUserId(
        @Param('id', ParseIntPipe) id: number,
    ) {
        console.log(`[api][profiles.controller][getSelfProfile] id: ${id}`);
        return this.socialService.send( { cmd: 'get-profile-by-user-id' }, id );
    }

    @UseGuards(RolesGuard)
    @RoleAccess({ minRoleVal: initRoles.OWNER.value, allowSelf: true })
    @ApiOperation({ summary: 'Изменение профиля по id' })
    @ApiResponse({ status: 200, description: 'Профиль пользователя с данным <id>, доступ у самого пользователя и у главного администратора' })
    @Put(':id')
    async updateProfile(
        @Param('id', ParseIntPipe) id: number,
        @Body(DtoValidationPipe) dto: UpdateProfileDto,
    ) {
        console.log(`[api][profiles.controller][getSelfProfile] id:\n ${id} \n\n dto: ${JSON.stringify(dto)} \n\n`);
        return this.socialService.send( { cmd: 'update-profile-by-user-id' }, {id, dto} );
    }
}
