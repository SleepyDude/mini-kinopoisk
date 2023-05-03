import { RpcException } from "@nestjs/microservices";
import { getModelToken } from "@nestjs/sequelize";
import { Test } from "@nestjs/testing";
import { Role } from "./roles.model";
import { RolesService } from "./roles.service";

const rolesRepMocks = {
    role: (roleModel: any) => ({
        create: jest.fn( () => roleModel ),
        findOne: jest.fn( () => roleModel ),
        findAll: jest.fn( () => [roleModel] ),
    }),
    roleThrow: () => ({
        create: jest.fn( () => {throw Error} ),
    }),
    roleNull: () => ({
        findOne: jest.fn( () => null ),
    })
}

async function getRolesService(roleRepMock: any = rolesRepMocks.role({ id: 1, value: 1})) {
    const module = await Test.createTestingModule({
        providers: [
            RolesService,
            { 
                provide: getModelToken(Role), 
                useValue: roleRepMock,
            },
        ],
    }).compile();

    return module.get<RolesService>(RolesService);
}

describe('RolesService', () => {

    describe('createRole', () => {

        it('Method defined', async () => {
            const rolesService = await getRolesService();
            expect(rolesService).toHaveProperty('createRole');
        });

        it('Successfull | userPerm = inf', async () => {
            const roleModel = {id: 1, value: 7}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            expect(await rolesService.createRole({name: 'a', value: 3, description: 'b'})).toBe(roleModel);
            expect(rolesRep.create).toHaveBeenCalled();
        });

        it('Successfull | userPerm = 15 & roleValue = 10', async () => {
            const roleModel = {id: 1, value: 10}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const userPerm = 15;

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            expect(await rolesService.createRole({name: 'a', value: 3, description: 'b'}, userPerm)).toBe(roleModel);
            expect(rolesRep.create).toHaveBeenCalled();
        });

        it('Error | userPerm = 15 & roleValue = 15', async () => {
            const roleModel = {id: 1, value: 10}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const userPerm = 15;

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.createRole({name: 'a', value: 15, description: 'b'}, userPerm))
                .rejects.toThrow(new RpcException('Можно создать роль только с меньшими чем у Вас правами'));

            expect(rolesRep.create).toBeCalledTimes(0);
        });

        it('Error | userPerm = 15 & roleValue = 17', async () => {
            const roleModel = {id: 1, value: 10}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const userPerm = 15;

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.createRole({name: 'a', value: 17, description: 'b'}, userPerm))
                .rejects.toThrow(new RpcException('Можно создать роль только с меньшими чем у Вас правами'));

            expect(rolesRep.create).toBeCalledTimes(0);
        });

        it('Error | userPerm = inf & releRep.create throw error', async () => {
        
            const rolesRep = rolesRepMocks.roleThrow(); // Создаем мок репозитория в котором выкидывается ошибка

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.createRole({name: 'a', value: 17, description: 'b'}))
                .rejects.toThrow(new RpcException('Ошибка при создании роли (роль уже существует)'));

            expect(rolesRep.create).toHaveBeenCalled();
        });

    });

    describe('getRoleByName', () => {
        it('Should return same object as role Repo', async () => {
            const roleModel = {id: 1, value: 7}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            expect(await rolesService.getRoleByName('a')).toBe(roleModel);
            expect(rolesRep.findOne).toHaveBeenCalled();
        });
    });

    describe('getAllRoles', () => {
        it('Should return same object as findAll rep method', async () => {
            const roleModel = {id: 1, value: 7}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            expect(await rolesService.getAllRoles()).toMatchObject([roleModel]);
            expect(rolesRep.findAll).toHaveBeenCalled();
        });
    });

    describe('Delete Role by Name', () => {

        it('Success | userPerm = inf & role exists', async () => {
            const roleModel = {id: 1, value: 7, destroy: jest.fn()}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            expect(await rolesService.deleteByName('a')).toBe(undefined);
            expect(rolesRep.findOne).toHaveBeenCalled();
            expect(roleModel.destroy).toHaveBeenCalled();
        });

        it('Success | userPerm = 17 & roleValue = 15 & role exists', async () => {
            const roleModel = {id: 1, value: 15, destroy: jest.fn()}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            expect(await rolesService.deleteByName('a', 17)).toBe(undefined);
            expect(rolesRep.findOne).toHaveBeenCalled();
            expect(roleModel.destroy).toHaveBeenCalled();
        });

        it('Error | userPerm = 17 & roleValue = 17 & role exists', async () => {
            const roleModel = {id: 1, value: 17, destroy: jest.fn()}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.deleteByName('a', 17))
                .rejects.toThrow(new RpcException('Недостаточно прав'));
            expect(rolesRep.findOne).toHaveBeenCalled();
            expect(roleModel.destroy).toHaveBeenCalledTimes(0);
        });

        it('Error | userPerm = 17 & roleValue = 20 & role exists', async () => {
            const roleModel = {id: 1, value: 20, destroy: jest.fn()}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.deleteByName('a', 17))
                .rejects.toThrow(new RpcException('Недостаточно прав'));
            expect(rolesRep.findOne).toHaveBeenCalled();
            expect(roleModel.destroy).toHaveBeenCalledTimes(0);
        });

        it('Error | userPerm = inf & role not exists', async () => {
            const rolesRep = rolesRepMocks.roleNull(); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.deleteByName('a'))
                .rejects.toThrow(new RpcException('Роли с таким именем не существует'));
            expect(rolesRep.findOne).toHaveBeenCalled();
        });

    });

    describe('Update Role by Name', () => {

        it('Success | userPerm = inf & role exists', async () => {
            const roleModel = {id: 1, value: 7, update: jest.fn()}; // То, что возвращают методы "репозитория"
            const rolesRep = rolesRepMocks.role(roleModel); // Создаем мок репозитория

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            expect(await rolesService.updateByName('a', {}, Infinity)).toBe(roleModel);
            expect(rolesRep.findOne).toHaveBeenCalled();
            expect(roleModel.update).toHaveBeenCalled();
        });

        // Попытка изменения значения роли с 10 до 13, userPerm = 17
        it('Success | userPerm = 17 & roleValue = 10 -> 13', async () => {
            const [userPerm, roleValue, roleNewValue] = [17, 10, 13];
            const roleModel = {id: 1, value: roleValue, update: jest.fn()};
            const rolesRep = rolesRepMocks.role(roleModel);

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            expect(await rolesService.updateByName('a', {value: roleNewValue}, userPerm)).toBe(roleModel);
            expect(rolesRep.findOne).toHaveBeenCalled();
            expect(roleModel.update).toHaveBeenCalled();
        });

        // Попытка изменения значения роли с 10 до 17, userPerm = 17
        it('Error | userPerm = 17 & roleValue = 10 -> 17', async () => {
            const [userPerm, roleValue, roleNewValue] = [17, 10, 17];
            const roleModel = {id: 1, value: roleValue, update: jest.fn()};
            const rolesRep = rolesRepMocks.role(roleModel);

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.updateByName('a', {value: roleNewValue}, userPerm))
                .rejects.toThrow(new RpcException('Недостаточно прав'));
        });

        // Попытка изменения значения роли с 10 до 20, userPerm = 17
        it('Error | userPerm = 17 & roleValue = 10 -> 20', async () => {
            const [userPerm, roleValue, roleNewValue] = [17, 10, 20];
            const roleModel = {id: 1, value: roleValue, update: jest.fn()};
            const rolesRep = rolesRepMocks.role(roleModel);

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.updateByName('a', {value: roleNewValue}, userPerm))
                .rejects.toThrow(new RpcException('Недостаточно прав'));
        });

        // Попытка изменения значения роли с 17 до 10, userPerm = 17
        it('Error | userPerm = 17 & roleValue = 17 -> 10', async () => {
            const [userPerm, roleValue, roleNewValue] = [17, 17, 10];
            const roleModel = {id: 1, value: roleValue, update: jest.fn()};
            const rolesRep = rolesRepMocks.role(roleModel);

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.updateByName('a', {value: roleNewValue}, userPerm))
                .rejects.toThrow(new RpcException('Недостаточно прав'));
        });

        // Попытка изменения значения роли с 20 до 10, userPerm = 17
        it('Error | userPerm = 17 & roleValue = 20 -> 10', async () => {
            const [userPerm, roleValue, roleNewValue] = [17, 20, 10];
            const roleModel = {id: 1, value: roleValue, update: jest.fn()};
            const rolesRep = rolesRepMocks.role(roleModel);

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.updateByName('a', {value: roleNewValue}, userPerm))
                .rejects.toThrow(new RpcException('Недостаточно прав'));
        });

        // Попытка изменения несуществующей роли
        it('Error | userPerm = inf & role not found', async () => {
            const rolesRep = rolesRepMocks.roleNull(); // Роль как будто не найдена, возвращает null

            const rolesService = await getRolesService(rolesRep); // Создаем сервис с данным моком

            await expect(rolesService.updateByName('a', {value: 5}, Infinity))
                .rejects.toThrow(new RpcException('Роли с таким именем не существует'));
        });
    });
})