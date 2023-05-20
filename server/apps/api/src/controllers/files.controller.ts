import { AvatarPathId, Link } from '@shared/dto';
import {
  Body,
  Controller,
  Delete,
  Inject,
  Post,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { AllExceptionsFilter } from '../filters/all.exceptions.filter';
import { RoleAccess } from '../guards/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { DtoValidationPipe } from '../pipes/dto-validation.pipe';
import { initRoles } from '@shared';

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с файлами')
@Controller('files')
export class FilesController {
  constructor(@Inject('SOCIAL-SERVICE') private socialService: ClientProxy) {}

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value, allowSelf: true })
  @ApiOperation({
    summary: `Удалить файлы неиспользующиеся более ${process.env.REQ_TIME} милисекунд`,
  })
  @ApiResponse({ status: 201, type: Boolean, description: 'Успешный запрос' })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Ошибка при очистке файлов',
  })
  @Delete('clean')
  async cleanFiles(): Promise<boolean> {
    return await firstValueFrom(
      this.socialService.send({ cmd: 'clean-files' }, {}),
    );
  }

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value })
  @ApiOperation({ summary: 'Загрузить аватар на сервер' })
  @ApiResponse({
    status: 201,
    type: AvatarPathId,
    description: 'Успешный запрос',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Ошибка при записи файла',
  })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload_avatar')
  async uploadFile(@UploadedFile('file') file): Promise<AvatarPathId> {
    const avatarPathId: AvatarPathId = await firstValueFrom(
      this.socialService.send({ cmd: 'upload-avatar' }, file),
    );
    return avatarPathId;
  }

  @UseGuards(RolesGuard)
  @RoleAccess({ minRoleVal: initRoles.ADMIN.value })
  @ApiOperation({ summary: 'Загрузить аватар по ссылке' })
  @ApiResponse({
    status: 201,
    type: AvatarPathId,
    description: 'Успешный запрос',
  })
  @ApiInternalServerErrorResponse({
    status: 500,
    description: 'Ошибка при записи файла',
  })
  @Post('upload_avatar_by_link')
  async uploadAvatarByLink(
    @Body(DtoValidationPipe) link: Link,
  ): Promise<AvatarPathId> {
    const avatarPathId: AvatarPathId = await firstValueFrom(
      this.socialService.send({ cmd: 'upload-avatar-by-link' }, link.link),
    );
    return avatarPathId;
  }
}
