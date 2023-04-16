import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create.user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Users } from './users.model';

@Injectable()
export class UsersService {
  constructor(@InjectModel(Users) private userRepository: typeof Users) {}

  async createUser(userDto: CreateUserDto) {
    console.log(userDto);
    return await this.userRepository.create(userDto);
  }

  async getAll() {
    return await this.userRepository.findAll();
  }

  async delete(id: string) {
    const user = await this.userRepository.findOne({ where: { id: id } });
    return user.destroy();
  }
}
