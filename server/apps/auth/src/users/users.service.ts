import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { RolesService } from '../roles/roles.service';
import { User } from '../../models/users.model';
import { HttpRpcException } from '@shared';
import { AddRoleDto, AddRoleDtoEmail, CreateUserDto } from '@shared/dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) private userRepository: typeof User,
    private readonly roleService: RolesService,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const role = await this.roleService.getRoleByName('USER');

    if (role === null) {
      throw new HttpRpcException(
        "Роль 'USER' не найдена, необходимо выполнение инициализации ресурса",
        HttpStatus.FAILED_DEPENDENCY,
      );
    }

    const candidate = await this.getUserByEmail(dto.email);
    if (candidate) {
      throw new HttpRpcException(
        `Пользователь с таким e-mail уже существует`,
        HttpStatus.CONFLICT,
      );
    }

    try {
      const user = await this.userRepository.create(dto);
      await user.$set('roles', [role.id]);
      user.roles = [role];
      return user;
    } catch (e) {
      throw new HttpRpcException(
        'Ошибка при создании пользователя',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllUsers() {
    return await this.userRepository.findAll({ include: { all: true } });
  }

  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOne({
      where: { email: email },
      include: { all: true },
    });
    return user;
  }

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      include: { all: true },
    });
    return user;
  }

  async getUserPublicById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      include: { all: true },
      attributes: ['email'],
    });
    return user;
  }

  async getUserByVkId(id: number) {
    const user = await this.userRepository.findOne({
      where: { vk_id: id },
      include: { all: true },
    });
    return user;
  }

  async deleteUserByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new HttpRpcException(
        `Пользователя с email ${email} не существует`,
        HttpStatus.NOT_FOUND,
      );
    }

    await user.destroy();
  }

  async addRole(dto: AddRoleDto) {
    const role = await this.roleService.getRoleByName(dto.roleName);
    const user = await this.userRepository.findByPk(dto.userId);

    if (role && user) {
      await user.$add('roles', role.id);
      return role;
    }

    throw new HttpRpcException(
      'Пользователь или роль не найдены',
      HttpStatus.NOT_FOUND,
    );
  }

  async addRoleByEmail(dto: AddRoleDtoEmail, userPerm = Infinity) {
    const role = await this.roleService.getRoleByName(dto.roleName);
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (userPerm <= role.value) {
      throw new HttpRpcException(
        'Вы не можете присвоить роль с правами большими или равными Вашим',
        HttpStatus.FORBIDDEN,
      );
    }

    if (role && user) {
      await user.$add('roles', role.id);
      return role;
    }

    throw new HttpRpcException(
      'Пользователь или роль не найдены',
      HttpStatus.NOT_FOUND,
    );
  }
}
