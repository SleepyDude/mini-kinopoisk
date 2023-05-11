import { AvatarId, AvatarPathId, Link, Path2File } from "@hotels2023nestjs/shared";
import { Body, Controller, Delete, Get, Inject, Param, ParseIntPipe, Post, UploadedFile, UseFilters, UseGuards, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { initRoles } from '../guards/init.roles'
import { RoleAccess } from "../guards/roles.decorator";
import { RolesGuard } from "../guards/roles.guard";
import { DtoValidationPipe } from "../pipes/dto-validation.pipe";

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с файлами')
@Controller('files')
export class FilesController {

  constructor(
      @Inject('SOCIAL-SERVICE') private socialService: ClientProxy,
  ) {}

  @UseGuards(RolesGuard)
  @RoleAccess({minRoleVal: initRoles.ADMIN.value, allowSelf: true})
  @ApiOperation({ summary: 'Удалить файлы неиспользующиеся более ${REQ_TIME} милисекунд' })
  @ApiResponse({ status: 201, type: Boolean })
  @Delete('clean')
  async cleanFiles(
  ) {
      return await firstValueFrom(this.socialService.send({ cmd: 'clean-files' }, {}));
  }

  @UseGuards(RolesGuard)
  @RoleAccess({minRoleVal: initRoles.ADMIN.value})
  @ApiOperation({ summary: 'Загрузить аватар на сервер' })
  @ApiResponse({ status: 201, type: AvatarPathId, description: 'Внутренний id файла в БД и путь к файлу на сервере' })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload_avatar')
  async uploadFile(
    @UploadedFile('file') file
  ) {
      const avatarId = await firstValueFrom(this.socialService.send({cmd: 'upload-avatar'}, file));
      return {avatarId};
  }

  @UseGuards(RolesGuard)
  @RoleAccess({minRoleVal: initRoles.ADMIN.value})
  @ApiOperation({ summary: 'Загрузить аватар по ссылке' })
  @ApiResponse({ status: 201, type: AvatarPathId, description: 'Внутренний id файла в БД и путь к файлу на сервере' })
  @Post('upload_avatar_by_link')
  async uploadAvatarByLink(
    @Body(DtoValidationPipe) link: Link
  ) {
      const avatarId = await firstValueFrom(this.socialService.send({cmd: 'upload-avatar-by-link'}, link.link));
      return {avatarId};
  }

}