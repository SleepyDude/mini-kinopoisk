import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';
import { CreateRoleDto } from './dto/create-role.dto';
// import { CreateRoleDto } from 'y/shared/dto';
import { DeleteRoleDto } from './dto/delete-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './roles.model';

@Injectable()
export class RolesService {

    constructor(@InjectModel(Role) private roleRepository: typeof Role) {}

    async createRole(dto: CreateRoleDto, userPerm: number = Infinity) {
        console.log(`[roles.service][create-role] dto: ${JSON.stringify(dto)}`);
        if (userPerm <= dto.value) {
            throw new HttpException('Можно создать роль только с меньшими чем у Вас правами', HttpStatus.FORBIDDEN);
        }

        try {
            const role = await this.roleRepository.create(dto);
            return role;
        } catch (error) {
            throw new HttpException('Ошибка при создании роли (роль уже существует)', HttpStatus.CONFLICT);
        }
    }

    async getRoleByName(name: string) {
        const role = await this.roleRepository.findOne({ where: {name: name} })
        return role;
    }

    async getAllRoles() {
        const roles = await this.roleRepository.findAll();
        return roles;
    }

    async deleteByName(name: string, userPerm: number = Infinity) {
        const role = await this.roleRepository.findOne({where: {name}});
        if (role) {
            // Проверим, что пользователь вправе удалить роль
            if (userPerm <= role.value) {
                throw new RpcException('Недостаточно прав');
            }
            role.destroy();
            return;
        }
        throw new RpcException('Роли с таким именем не существует');
    }

    async updateByName(name: string, dto: UpdateRoleDto, userPerm: number) {
        // console.log(`update role with name ${name}`)
        const role = await this.roleRepository.findOne({where: {name: name}});
        // console.log(`find role ${JSON.stringify(role)}`)
        if (role) {
            if (userPerm <= role.value || dto.value && dto.value >= userPerm) {
                throw new HttpException('Недостаточно прав', HttpStatus.FORBIDDEN);
            }
            role.update(dto);
            return role;
        }
        throw new HttpException('Роли с таким именем не существует', HttpStatus.NOT_FOUND);
    }

}
