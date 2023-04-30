import { RpcException } from "@nestjs/microservices";
import { getModelToken } from "@nestjs/sequelize";
import { Test } from "@nestjs/testing";
import { RolesService } from "../roles/roles.service";
import { User } from "./users.model";
import { UsersService } from "./users.service";

const role9Model = () => ({ 
    id: 9,
});

const roleServiceMocks = {
    role9: (roleModel: any = role9Model()) => ({
        getRoleByName: jest.fn( () => roleModel ),
    }),
    roleNull: () => ({
        getRoleByName: jest.fn( () => null ),
    }),
}

const user13Model = () => ({ 
    $set: jest.fn(),
    $add: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    id: 13,
});

const userRepMocks = {

    // Возвращает объект с id = 13 и с методом $set()
    user13: (userModel: any = user13Model()) => ({
        create: jest.fn( (dto: any) => {
            return userModel;
        }),
        findAll: jest.fn( () => [userModel] ),
        findOne: jest.fn( () => userModel ),
        findByPk: jest.fn( () => userModel ),
    }),

    userNull: () => ({
        findOne: jest.fn(() => null),
        findByPk: jest.fn((val) => null),
    }),

    // "База" выдает ошибку
    userThrow: () => ({
        create: jest.fn( (dto: any) => {
            throw Error;
        }),
    }),
}

async function getUsersService(roleServiceMock: any = roleServiceMocks.role9(), userRepMock: any = userRepMocks.user13()) {
    const module = await Test.createTestingModule({
        providers: [
            UsersService,
            {
                provide: RolesService,
                useValue: roleServiceMock,
            },
            { 
                provide: getModelToken(User), 
                useValue: userRepMock,
            },
        ],
    }).compile();

    return module.get<UsersService>(UsersService);
}

describe('UsersService', () => {

    describe('createUser', () => {

        it('method defined', async () => {
            const usersService = await getUsersService();
            expect(usersService).toHaveProperty('createUser');
        });

        it('Successfull user creation', async () => {
            // Оба мока выдают корректные данные
            const role9 = roleServiceMocks.role9();
            const user13 = userRepMocks.user13();

            const usersService = await getUsersService(role9, user13);

            expect(await usersService.createUser({email: 'a', password: 'b'})).toBe(user13Model().id);
            expect(role9.getRoleByName).toHaveBeenCalled();
            expect(user13.create).toHaveBeenCalled();
        });

        it('role "USER" not found => Error', async () => {
            // role mock выдает null как будто роль 'USER' не найдена
            const roleNull = roleServiceMocks.roleNull();
            const user13 = userRepMocks.user13();

            const usersService = await getUsersService(roleNull, user13);

            await expect(usersService.createUser({email: 'a', password: 'b'}))
                .rejects.toThrow(new RpcException("Роль 'USER' не найдена, необходимо выполнение инициализации ресурса")
            );
            expect(roleNull.getRoleByName).toHaveBeenCalled();
        });

        it('userRep.create error => Error', async () => {
            const role9 = roleServiceMocks.role9();
            const userThrow = userRepMocks.userThrow();

            const usersService = await getUsersService(role9, userThrow);

            await expect(usersService.createUser({email: 'a', password: 'b'}))
                .rejects.toThrow(new RpcException("Пользователь уже существует"));
            expect(role9.getRoleByName).toHaveBeenCalled();
            expect(userThrow.create).toHaveBeenCalled();
        });

    });

    describe('getAllUsers', () => {

        it('method defined', async () => {
            const usersService = await getUsersService();
            expect(usersService).toHaveProperty('getAllUsers');
        });

        it('has called findAll', async () => {
            const u13Model = user13Model();
            const user13 = userRepMocks.user13(u13Model);

            const usersService = await getUsersService(undefined, user13);
            expect(await usersService.getAllUsers()).toMatchObject([u13Model]);

            expect(user13.findAll).toHaveBeenCalled();
        });
    });

    describe('getUserByEmail', () => {

        it('method defined', async () => {
            const usersService = await getUsersService();
            expect(usersService).toHaveProperty('getUserByEmail');
        });

        it('has called findOne', async () => {
            const u13Model = user13Model();
            const user13 = userRepMocks.user13(u13Model);

            const usersService = await getUsersService(undefined, user13);
            expect(await usersService.getUserByEmail('a')).toBe(u13Model); // Проверим, что возвращает он тот же объект что вернулся из базы

            expect(user13.findOne).toHaveBeenCalled();
        });
    });

    describe('getUserById', () => {

        it('method defined', async () => {
            const usersService = await getUsersService();
            expect(usersService).toHaveProperty('getUserById');
        });

        it('has called findOne', async () => {
            const u13Model = user13Model();
            const user13 = userRepMocks.user13(u13Model);

            const usersService = await getUsersService(undefined, user13);
            expect(await usersService.getUserById(1)).toBe(u13Model); // Проверим, что возвращает он тот же объект что вернулся из базы

            expect(user13.findOne).toHaveBeenCalled();
        });
    });

    describe('Update User by email', () => {

        it('method defined', async () => {
            const usersService = await getUsersService();
            expect(usersService).toHaveProperty('updateUserByEmail');
        });

        it('success update', async () => {
            const u13Model = user13Model();
            const user13 = userRepMocks.user13(u13Model);

            const usersService = await getUsersService(undefined, user13);

            expect(await usersService.updateUserByEmail('a', {})).toBe(u13Model);
            expect(user13.findOne).toHaveBeenCalled();
            expect(u13Model.update).toHaveBeenCalled();
        });

        it('user not found => RpcError', async () => {
            const userNull = userRepMocks.userNull();

            const usersService = await getUsersService(undefined, userNull);

            expect(usersService.updateUserByEmail('a@mail.ru', {}))
                .rejects.toThrow(new RpcException("Пользователя с email a@mail.ru не существует"));

            expect(userNull.findOne).toHaveBeenCalled();
        });

    });

    describe('Delete User by email', () => {

        it('method defined', async () => {
            const usersService = await getUsersService();
            expect(usersService).toHaveProperty('deleteUserByEmail');
        });

        it('success delete', async () => {
            const u13Model = user13Model();
            const user13 = userRepMocks.user13(u13Model);

            const usersService = await getUsersService(undefined, user13);

            expect(await usersService.deleteUserByEmail('a')).toBe(undefined);
            expect(user13.findOne).toHaveBeenCalled();
            expect(u13Model.destroy).toHaveBeenCalled();
        });

        it('user not found => RpcError', async () => {
            const userNull = userRepMocks.userNull();

            const usersService = await getUsersService(undefined, userNull);

            expect(usersService.deleteUserByEmail('a@mail.ru'))
                .rejects.toThrow(new RpcException("Пользователя с email a@mail.ru не существует"));

            expect(userNull.findOne).toHaveBeenCalled();
        });

    });

    describe('Add role', () => {

        it('method defined', async () => {
            const usersService = await getUsersService();
            expect(usersService).toHaveProperty('addRole');
        });

        it('success add role', async () => {
            const u13Model = user13Model();
            const r9Model = role9Model();
            const user13 = userRepMocks.user13(u13Model);
            const role9 = roleServiceMocks.role9(r9Model);

            const usersService = await getUsersService(role9, user13);

            expect(await usersService.addRole({roleName: 'a', userId: 1})).toBe(r9Model);

            expect(user13.findByPk).toHaveBeenCalled();
            expect(u13Model.$add).toHaveBeenCalled();
            expect(role9.getRoleByName).toHaveBeenCalled();
        });

        it('user not found => RpcError', async () => {
            const userNull = userRepMocks.userNull();

            const usersService = await getUsersService(undefined, userNull);

            await expect(usersService.addRole({roleName: 'a', userId: 1}))
                .rejects.toThrow(new RpcException("Пользователь или роль не найдены"));
            
            expect(userNull.findByPk).toHaveBeenCalled();

        });

        it('role not found => RpcError', async () => {
            const roleNull = roleServiceMocks.roleNull();

            const usersService = await getUsersService(roleNull);

            await expect(usersService.addRole({roleName: 'a', userId: 1}))
                .rejects.toThrow(new RpcException("Пользователь или роль не найдены"));

            expect(roleNull.getRoleByName).toHaveBeenCalled();
        });

    });

    describe('Add role By Email', () => {

        it('method defined', async () => {
            const usersService = await getUsersService();
            expect(usersService).toHaveProperty('addRoleByEmail');
        });

        it('success add role', async () => {
            const u13Model = user13Model();
            const user13 = userRepMocks.user13(u13Model);
            const r9Model = role9Model();
            const role9 = roleServiceMocks.role9(r9Model);

            const usersService = await getUsersService(role9, user13);

            expect(await usersService.addRoleByEmail({roleName: 'a', email: 'b'})).toBe(r9Model);

            expect(user13.findOne).toHaveBeenCalled();
            expect(u13Model.$add).toHaveBeenCalled();
            expect(role9.getRoleByName).toHaveBeenCalled();
        });

        it('user not found => RpcError', async () => {
            const userNull = userRepMocks.userNull();

            const usersService = await getUsersService(undefined, userNull);

            await expect(usersService.addRoleByEmail({roleName: 'a', email: 'b'}))
                .rejects.toThrow(new RpcException("Пользователь или роль не найдены"));
            
            expect(userNull.findOne).toHaveBeenCalled();

        });

        it('role not found => RpcError', async () => {
            const roleNull = roleServiceMocks.roleNull();

            const usersService = await getUsersService(roleNull);

            await expect(usersService.addRoleByEmail({roleName: 'a', email: 'b'}))
                .rejects.toThrow(new RpcException("Пользователь или роль не найдены"));

            expect(roleNull.getRoleByName).toHaveBeenCalled();
        });

    })
})