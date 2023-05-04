import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { HttpRpcException } from '@hotels2023nestjs/shared';
import { RolesService } from '../roles/roles.service';
import { AddRoleDto, AddRoleDtoEmail } from './dto/add-role.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './users.model';

@Injectable()
export class UsersService {

    constructor(
        @InjectModel(User) private userRepository: typeof User,
        private readonly roleService: RolesService
    ) {}

    async createUser(dto: CreateUserDto): Promise<number> {
        const role = await this.roleService.getRoleByName('USER');
        // console.log(`test get role: ${JSON.stringify(role)}`);

        if (role === null) {
            throw new HttpRpcException("Роль 'USER' не найдена, необходимо выполнение инициализации ресурса", HttpStatus.I_AM_A_TEAPOT);
        }
        
        try {
            let user = await this.userRepository.create(dto);
            await user.$set('roles', [role.id]); // $set позволяет изменить объект и сразу обновить его в базе
            return user.id;
        } catch (e) {
            // console.log(`\nError in userRepository.create:\n\n${JSON.stringify(e)}\n\n`);
            throw new HttpRpcException("Пользователь уже существует", HttpStatus.CONFLICT);
        }
    }

    async getAllUsers() {
        return await this.userRepository.findAll({ include: {all: true} });
    }

    async getUserByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: {email: email}, include: {all: true} });
        return user;
    }

    async getUserById(id: number) {
        const user = await this.userRepository.findOne({ where: {id: id}, include: {all: true} });
        return user;
    }

    async updateUserByEmail(email: string, dto: UpdateUserDto) {
        const user = await this.userRepository.findOne({where: {email}});

        if (!user) {
            throw new HttpRpcException(`Пользователя с email ${email} не существует`, HttpStatus.NOT_FOUND);
        }

        await user.update(dto);
        return user;
    }

    async deleteUserByEmail(email: string) {
        const user = await this.userRepository.findOne({where: {email}});

        if (!user) {
            throw new HttpRpcException(`Пользователя с email ${email} не существует`, HttpStatus.NOT_FOUND);
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
        
        throw new HttpRpcException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    }

    async addRoleByEmail(dto: AddRoleDtoEmail, userPerm: number = Infinity) {
        const role = await this.roleService.getRoleByName(dto.roleName);
        const user = await this.userRepository.findOne({ where: {email: dto.email} });

        if (userPerm <= role.value) {
            throw new HttpRpcException('Вы не можете присвоить роль с правами большими или равными Вашим', HttpStatus.FORBIDDEN);
            // throw new RpcException('Вы не можете присвоить роль с правами большими или равными Вашим');
        }

        if (role && user) {
            await user.$add('roles', role.id);
            return role;
        }
        
        throw new HttpRpcException('Пользователь или роль не найдены', HttpStatus.NOT_FOUND);
    }
}
