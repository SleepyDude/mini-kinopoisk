import { Controller, Delete, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseFilesService } from './files.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { profile } from 'console';

@Controller('files')
@ApiTags('Files')
export class DbFilesController {

    constructor(private dbFilesService: DatabaseFilesService) {
    }

    @MessagePattern({ cmd: 'clean-files' })
    async cleanUnusedFiles(
    ) {
        return await this.dbFilesService.cleanUnusedFiles();
    }

    @MessagePattern({ cmd: 'set-avatar' })
    async setAvatar(
        @Payload() {profileId, avatarId}
    ) {
        return await this.dbFilesService.setAvatar(profileId, avatarId);
    }

    @MessagePattern({ cmd: 'unset-avatar' })
    async unsetAvatar(
        @Payload() profileId : number
    ) {
        return await this.dbFilesService.unSetAvatar(profileId);
    }

    @MessagePattern({ cmd: 'upload-file' })
    async uploadFile(
        @Payload() file
    ) {
        console.log(`[CONTROLLER]`)
        return await this.dbFilesService.uploadFile(file);
    }

}
