import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpRpcException } from '@shared';
import { CreateRoleDto, UpdateRoleDto } from '@shared/dto';
import { Role } from '../../models/roles.model';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

  async createRole(dto: CreateRoleDto, userPerm = Infinity) {
    // console.log(`[roles.service][create-role] dto: ${JSON.stringify(dto)}`);
    if (userPerm <= dto.value) {
      throw new HttpRpcException(
        'Можно создать роль только с меньшими чем у Вас правами',
        HttpStatus.FORBIDDEN,
      );
    }

    try {
      const role = await this.roleRepository.create(dto);
      return role;
    } catch (error) {
      throw new HttpRpcException(
        'Ошибка при создании роли (роль уже существует)',
        HttpStatus.CONFLICT,
      );
    }
  }

  async getRoleByName(name: string) {
    const role = await this.roleRepository.findOne({ where: { name: name } });
    return role;
  }

  async getAllRoles(): Promise<Role[]> {
    const roles = await this.roleRepository.findAll();
    return roles;
  }

  async deleteByName(name: string, userPerm = Infinity) {
    const role = await this.roleRepository.findOne({ where: { name } });
    if (role) {
      // Проверим, что пользователь вправе удалить роль
      if (userPerm <= role.value) {
        throw new HttpRpcException('Недостаточно прав', HttpStatus.FORBIDDEN);
      }
      role.destroy();
      return;
    }
    throw new HttpRpcException(
      'Роли с таким именем не существует',
      HttpStatus.NOT_FOUND,
    );
  }

  async updateByName(name: string, dto: UpdateRoleDto, userPerm: number) {
    // console.log(`update role with name ${name}`)
    const role = await this.roleRepository.findOne({ where: { name: name } });
    // console.log(`find role ${JSON.stringify(role)}`)
    if (role) {
      if (userPerm <= role.value || (dto.value && dto.value >= userPerm)) {
        throw new HttpRpcException('Недостаточно прав', HttpStatus.FORBIDDEN);
      }
      role.update(dto);
      return role;
    }
    throw new HttpRpcException(
      'Роли с таким именем не существует',
      HttpStatus.NOT_FOUND,
    );
  }
}
