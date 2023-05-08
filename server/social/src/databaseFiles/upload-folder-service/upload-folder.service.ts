import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';

@Injectable()
export class UploadFolderService {
    uploadPath = path.resolve(__dirname, '..', 'upload');

    async createFile(file): Promise<any> {
         try {
            const fileName = uuid.v4() + '.jpg';
            
            if (!fs.existsSync(this.uploadPath)) {
                fs.mkdirSync(this.uploadPath, {recursive: true})
            }
            fs.writeFileSync(path.join(this.uploadPath, fileName), Buffer.from(file.buffer))
            return fileName;
            
         } catch(e) {
            throw new HttpException('An error occurred while writing the file', HttpStatus.INTERNAL_SERVER_ERROR)
         }
    }

    async deleteFile(fileName: string) {
        const filePath = path.join(this.uploadPath, fileName)
        fs.unlinkSync(filePath)
        return `File ${fileName} deleted` // for testing with postman
    }
}
