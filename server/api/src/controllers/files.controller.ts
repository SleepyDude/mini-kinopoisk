import { Controller, Delete, Inject, Post, UploadedFile, UseFilters, UseGuards, UseInterceptors } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { firstValueFrom } from "rxjs";
import { AllExceptionsFilter } from "src/filters/all.exceptions.filter";
import { initRoles } from "src/guards/init.roles";
import { RoleAccess } from "src/guards/roles.decorator";
import { RolesGuard } from "src/guards/roles.guard";

@UseFilters(AllExceptionsFilter)
@ApiTags('Работа с файлами')
@Controller('files')
export class FilesController {

  constructor(
      @Inject('SOCIAL-SERVICE') private socialService: ClientProxy,
  ) {}

  @UseGuards(RolesGuard)
  @RoleAccess({minRoleVal: initRoles.ADMIN.value, allowSelf: true})
  @ApiOperation({ summary: 'Удалить неиспользуемые файлы' })
  @ApiResponse({ status: 201, type: Boolean })
  @Delete('clean')
  async cleanFiles(
  ) {
      return await firstValueFrom(this.socialService.send({ cmd: 'clean-files' }, {}));
  }

  // @UseGuards(RolesGuard)
  // @RoleAccess({minRoleVal: initRoles.ADMIN.value, allowSelf: true})
  @ApiOperation({ summary: 'Загрузить файл' })
  @ApiResponse({ status: 201, type: Number })
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async uploadFile(
    @UploadedFile() file
  ) {
    console.log(`[files][controller][run]`)
      const fileId = await firstValueFrom(this.socialService.send({cmd: 'upload-file'}, file));
      return {id: fileId};
  }
}