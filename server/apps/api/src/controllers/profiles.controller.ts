import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { ClientProxy } from '@nestjs/microservices';
import { AvatarId, AvatarPathId, UpdateProfileDto } from '@shared/dto';
import { ProfilePublic } from '@shared/interfaces';
import { RolesGuard } from '../guards/roles.guard';
import { RoleAccess } from '../guards/roles.decorator';
import { initRoles } from '@shared';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { firstValueFrom } from 'rxjs';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserData } from '../decorators/user-data.decorator';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с профилем пользователя')
@Controller('profiles')
export class ProfilesController {
  constructor(@Inject('SOCIAL-SERVICE') private socialService: ClientProxy) {}

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.USER.value, allowSelf: true })
  @ApiOperation({
    summary: 'Получение своего профиля (профиля по данным в access токене)',
  })
  @ApiResponse({
    status: 200,
    type: ProfilePublic,
    description: 'Успешный запрос',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Профиль не найден',
  })
  @Get('/me')
  async getMyProfile(@UserData('id', ParseIntPipe) id: number) {
    return this.socialService.send({ cmd: 'get-profile-by-user-id' }, id);
  }

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value, allowSelf: true })
  @ApiOperation({
    summary:
      'Получение профиля по id, доступ у самого пользователя и администратора',
  })
  @ApiResponse({
    status: 200,
    type: ProfilePublic,
    description: 'Успешный запрос',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Профиль не найден',
  })
  @Get(':id')
  async getProfileByUserId(@Param('id', ParseIntPipe) id: number) {
    return this.socialService.send({ cmd: 'get-profile-by-user-id' }, id);
  }

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.OWNER.value, allowSelf: true })
  @ApiOperation({
    summary:
      'Изменение профиля по id, доступ у самого пользователя и у главного администратора',
  })
  @ApiResponse({
    status: 200,
    type: ProfilePublic,
    description: 'Успешный запрос',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Профиль не найден',
  })
  @Put(':id')
  async updateProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body(DtoValidationPipe) dto: UpdateProfileDto,
  ) {
    return this.socialService.send(
      { cmd: 'update-profile-by-user-id' },
      { id, dto },
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value, allowSelf: true })
  @ApiOperation({
    summary:
      'Удалить аватар профиля по id, доступ у самого пользователя и у главного администратора',
  })
  @ApiResponse({
    status: 201,
    type: Boolean,
    description: 'Успешный запрос',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Профиль не найден',
  })
  @Get('/unset_avatar/:id')
  async unsetAvatar(@Param('id', ParseIntPipe) id: number) {
    await firstValueFrom(this.socialService.send({ cmd: 'unset-avatar' }, id));
    return true;
  }

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value, allowSelf: true })
  @ApiOperation({
    summary:
      'Получить аватар профиля по id, доступ у самого пользователя и у главного администратора',
  })
  @ApiResponse({
    status: 201,
    type: AvatarPathId,
    description: 'Успешное выполнение',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Аватар не найден',
  })
  @Get('/avatar/:id')
  async getAvatar(@Param('id', ParseIntPipe) id: number) {
    const { path2File, avatarId } = await firstValueFrom(
      this.socialService.send({ cmd: 'get-avatar' }, id),
    );
    return { path2File, avatarId };
  }

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value, allowSelf: true })
  @ApiOperation({
    summary:
      'Установить аватар профиля из файла, доступ у самого пользователя и у главного администратора',
  })
  @ApiResponse({
    status: 201,
    type: AvatarId,
    description: 'Успешное выполнение',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Ошибка при записи файла',
  })
  @ApiNotFoundResponse({
    status: 404,
    description: 'Ошибка при присваивании аватара',
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload_avatar/:id')
  async uploadAvatar(
    @UploadedFile('file') file,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const avatarId = await firstValueFrom(
      this.socialService.send({ cmd: 'upload-avatar' }, file),
    );
    await firstValueFrom(
      this.socialService.send({ cmd: 'set-avatar' }, { id, avatarId }),
    );
    return { avatarId };
  }
}
