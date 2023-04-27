import { getModelToken } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { RolesService } from "../roles/roles.service";
import { User } from "./users.model";
import { UsersService } from "./users.service";

/*
// Успешное создание пользователяя
// 
// 
*/

describe('UsersService', () => {
    let usersService: UsersService;

    beforeEach(async () => {

        const mockRolesService = {
            getRoleByName: async (_: string) => ({id: 9})
        };

        const mockUserRepository = {
            create: async (dto: any) => {
                console.log(`[mock usrRep][create] dto: ${JSON.stringify(dto)}`);
                return  { $set: () => jest.fn(), id: 13 };
            },
        }

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: RolesService,
                    useValue: mockRolesService,
                },
                { 
                    provide: getModelToken(User), 
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        usersService = module.get<UsersService>(UsersService);
    });

    it('UsersService - should be defined', () => {
        expect(usersService).toBeDefined();
    })

    describe('createUser', () => {

        it('Should return userId. Should call rolesService and get role. Should create object in db', async () => {
            const userDto = {email: "user@mail.ru", password: "password"};
            console.log(`[test][users.service] userDto: ${JSON.stringify(userDto)}`);
            expect(await usersService.createUser(userDto)).toBe(13);
        });

    });
})