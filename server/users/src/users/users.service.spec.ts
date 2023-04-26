import { getModelToken } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { RolesService } from "../roles/roles.service";
import { User } from "./users.model";
import { UsersService } from "./users.service";
import { createMock, DeepMocked } from '@golevelup/ts-jest';

class RoleServiceMock {
    getRoleByName(name: string) {
        return {
            id: 9,
            name: 'ROLENAME',
            value: 4,
            description: 'tesing role',
        }
    }
}

describe('UsersService', () => {
    let usersService: UsersService;
    let rolesService: DeepMocked<RolesService>;

    beforeEach(async () => {

        const mockUserRepository = {
            create: jest.fn(),
        }

        const module: TestingModule = await Test.createTestingModule({
            imports: [],
            providers: [ 
                UsersService,
                {
                    provide: RolesService,
                    useValue: createMock<RolesService>(),
                },
                { 
                    provide: getModelToken(User), 
                    useValue: { mockUserRepository } 
                },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
        rolesService = module.get(RolesService);
    });

    it('UsersService - should be defined', () => {
        expect(usersService).toBeDefined();
    })

    // describe('createUser', () => {

    // it('Should return userId and create user in database', async () => {
    //     const userDto = {email: "user@mail.ru", password: "password"};
    //     console.log(`[test][users.service] userDto: ${JSON.stringify(userDto)}`);
    //     expect(usersService.createUser(userDto)).toBe(13);
    // });

    // });
})