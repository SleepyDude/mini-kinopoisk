import { Controller, Delete, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DatabaseFilesService } from './files.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

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

    @MessagePattern({ cmd: 'upload-file' })
    async uploadFile(
        @Payload() file
    ) {
        return await this.dbFilesService.uploadFile(file);
    }

}
