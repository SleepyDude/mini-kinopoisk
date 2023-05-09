import { Injectable, NotFoundException, HttpException, HttpStatus  } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import * as fs from 'fs';
import * as path from 'path';
import * as uuid from 'uuid';
import { DatabaseFile, HttpRpcException } from '@hotels2023nestjs/shared';
 
@Injectable()
export class DatabaseFilesService {
  constructor(
    @InjectModel(DatabaseFile) private dbFilesRepository: typeof DatabaseFile
  ) {}

  uploadPath = path.resolve(__dirname, '..', 'upload');


  async uploadFile(fileContent) : Promise<number> {
    try {
      const fileName = uuid.v4() + '.jpg';
      console.log(`[FILENAME] == ${fileName}`)

      // console.log(`[FILE] == ${JSON.stringify(fileContent)}`)
      
      if (!fs.existsSync(this.uploadPath)) {
        console.log(`[FILE] == IN IF`)
          fs.mkdirSync(this.uploadPath, {recursive: true})
      }
      const path2file = path.join(this.uploadPath, fileName);
      console.log(`[FILE] == ${path2file}`)
      fs.writeFileSync(path2file, Buffer.from(fileContent.buffer))
      const dbFile = await this.dbFilesRepository.create({
        fileName: fileName,
        path2File: path2file
      })
      return dbFile.id;
      
   } catch(e) {
      throw new HttpException('Ошибка при записи файла', HttpStatus.INTERNAL_SERVER_ERROR)
   }
  }

  async setAvatar(profileId: number, avatarId: number): Promise<string> {
    try {
    const file = await this.dbFilesRepository.findOne({where: {id: avatarId}});
    file['essenceProfileId'] = profileId;
    await file.save();
    return file.fileName;
    } catch(e) {
      throw new HttpRpcException('Ошибка при присваивании аватара', HttpStatus.NOT_FOUND);
    }
  }

  async unSetAvatar(profileId: number): Promise<void> {
    const files = await this.dbFilesRepository.findAll({where: {essenceProfileId: profileId}});
    if (files) {
      for (let file of files) {
        file['essenceProfileId'] = null;
        await file.save();
      }
    }
  }

  async cleanUnusedFiles() {
    const REQUIRED_TIME = new Date(Date.now() - 60 * 60 * 1000)
    const files = await this.dbFilesRepository.findAll({where: 
      {essenceProfileId: null, createdAt: {[Op.lte]: REQUIRED_TIME}}
    })
    for (let file of files) {
      this.deleteFile(file.fileName);
    }
    return true;
  }

  async deleteFile(fileName: string) {
    const filePath = path.join(this.uploadPath, fileName)
    fs.unlinkSync(filePath)
    const file = await this.dbFilesRepository.findOne({where: {path2File: filePath}});
    await file.destroy();
    return `File ${fileName} deleted` // for testing with postman
 }
}
 