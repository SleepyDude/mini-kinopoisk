import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { Test } from '@nestjs/testing';
import { InitService } from '../src/init/init.service';
import { VkService } from '../src/vk/vk.service';
import { GoogleService } from '../src/google/google.service';
import { TokensService } from '../src/tokens/tokens.service';

const moduleMocker = new ModuleMocker(global);

describe('Auth module', () => {
  let authController: AuthController;
  let authService: AuthService;
  let initService: InitService;
  let vkService: VkService;
  let tokenService: TokensService;
  let googleService: GoogleService;

  const mockAuthService = {
    login: jest.fn(() => {
      return 'login work';
    }),
    registration: jest.fn(() => {
      return 'registration work';
    }),
    logout: jest.fn(() => {
      return 'logout work';
    }),
  };
  const mockInitService = {
    createAdminAndRoles: jest.fn(() => {
      return 'init work';
    }),
  };
  const mockVkService = {
    loginVk: jest.fn(() => {
      return 'login vk work';
    }),
  };
  const mockGoogleService = {
    googleLogin: jest.fn(() => {
      return 'googleLogin work';
    }),
  };
  const mockTokenService = {
    refresh: jest.fn(() => {
      return 'refresh work';
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: InitService,
          useValue: mockInitService,
        },
        {
          provide: VkService,
          useValue: mockVkService,
        },
        {
          provide: GoogleService,
          useValue: mockGoogleService,
        },
        {
          provide: TokensService,
          useValue: mockTokenService,
        },
      ],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        if (token === AuthService) {
          return { findAll: jest.fn().mockResolvedValue(results) };
        }
        if (typeof token === 'function') {
          const mockMetadata = moduleMocker.getMetadata(
            token,
          ) as MockFunctionMetadata<any, any>;
          const Mock = moduleMocker.generateFromMetadata(mockMetadata);
          return new Mock();
        }
      })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    authService = moduleRef.get(AuthService);
    initService = moduleRef.get(InitService);
    vkService = moduleRef.get(VkService);
    googleService = moduleRef.get(GoogleService);
    tokenService = moduleRef.get(TokensService);
    authController = moduleRef.get(AuthController);
  });

  it('controller defined', () => {
    expect(authController).toBeDefined();
  });

  it('Check init service', async () => {
    expect(await authController.init()).toEqual('init work');
    const spyServiceInit = jest.spyOn(initService, 'createAdminAndRoles');
    expect(spyServiceInit).toBeCalledTimes(1);
  });

  it('Check vkAuth', async () => {
    expect(await authController.vkAuth({ code: '123' })).toEqual(
      'login vk work',
    );
    const spyServiceLoginVk = jest.spyOn(vkService, 'loginVk');
    expect(spyServiceLoginVk).toBeCalledTimes(1);
  });

  it('Check google auth redirect', async () => {
    expect(await authController.googleAuthRedirect({ code: '123' })).toEqual(
      'googleLogin work',
    );
    const spyServiceGoogleLogin = jest.spyOn(googleService, 'googleLogin');
    expect(spyServiceGoogleLogin).toBeCalledTimes(1);
  });

  it('Check login', async () => {
    expect(
      await authController.login({ email: '123', password: '123' }),
    ).toEqual('login work');
    const spyServiceLogin = jest.spyOn(authService, 'login');
    expect(spyServiceLogin).toBeCalledTimes(1);
  });

  it('Check registration', async () => {
    expect(
      await authController.registration({ email: '123', password: '123' }),
    ).toEqual('registration work');
    const spyServiceRegistration = jest.spyOn(authService, 'registration');
    expect(spyServiceRegistration).toBeCalledTimes(1);
  });

  it('Check logout', async () => {
    expect(await authController.logout('refresh')).toEqual('logout work');
    const spyServiceLogout = jest.spyOn(authService, 'logout');
    expect(spyServiceLogout).toBeCalledTimes(1);
  });

  it('Check refresh', async () => {
    expect(await authController.refresh('refresh')).toEqual('refresh work');
    const spyServiceRefresh = jest.spyOn(tokenService, 'refresh');
    expect(spyServiceRefresh).toBeCalledTimes(1);
  });
});
