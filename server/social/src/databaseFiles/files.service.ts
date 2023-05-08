import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { UploadFolderService } from './upload-folder-service/upload-folder.service';
import { DatabaseFile } from '@hotels2023nestjs/shared';
 
@Injectable()
export class DatabaseFilesService {
  constructor(
    @InjectModel(DatabaseFile) private dbFilesRepository: typeof DatabaseFile,
    private uploadFolderService: UploadFolderService
  ) {}

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

 
  async getFileByPath(filePath: string) {
    const file = await this.dbFilesRepository.findOne({where: {path: filePath}});
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async getFileByID(id: number) {
    const file = await this.dbFilesRepository.findOne({where: {id: id}});
    if (!file) {
      throw new NotFoundException();
    }
    return file;
  }

  async saveDatabaseFile(id: number, essenceTable: string, essenceID: number) {
    const file = await this.getFileByID(id);
    file['essenceTable'] = essenceTable;
    file['essenceID'] = essenceID; 
    return await file.save();
  }

  async deleteDbFile(path: string) {
    const file = await this.dbFilesRepository.findOne({where: {path: path}});
    await this.dbFilesRepository.destroy({where: {path: path}});
    return `File ${file.filename} deleted from Database`
    }

  async cleanUnusedFiles() {
    const REQUIRED_TIME = new Date(Date.now() - 60 * 60 * 1000)
    const files = await this.dbFilesRepository.findAll({where: 
      {essenceID: null, essenceTable: null, createdAt: {[Op.lte]: REQUIRED_TIME}}
    })
    for (let file of files) {
      this.uploadFolderService.deleteFile(file.filename);
      this.dbFilesRepository.destroy({where: {id: file.id}});
    }
    return true;
  }

  async uploadFile(fileContent) {
    const fileName = await this.uploadFolderService.createFile(fileContent);
    const dbFile = await this.dbFilesRepository.create({
      filename: fileName,
      content: fileContent
    })
    return {dbId: dbFile.id, fileName};
  }
}
 