import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../src/users/users.controller';
import { UsersService } from '../src/users/users.service';

describe('UsersController', () => {
  let usersController: UsersController;
  let spyService: UsersService;

  beforeEach(async () => {
    const UsersServiceProvider = {
      provide: UsersService,
      useFactory: () => ({
        createUser: jest.fn(() => 13),
      }),
    };

    const app: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersServiceProvider],
    }).compile();

    usersController = app.get<UsersController>(UsersController);
    spyService = app.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should call createUser', async () => {
      const userDto = { email: 'user@mail.ru', password: 'password' };
      usersController.createUser(userDto);
      expect(spyService.createUser).toHaveBeenCalled();
    });

    it('should return userId', async () => {
      const userDto = { email: 'user@mail.ru', password: 'password' };
      expect(spyService.createUser(userDto)).toBe(13);
    });
  });
});
