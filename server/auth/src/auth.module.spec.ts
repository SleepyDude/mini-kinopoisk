import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { AuthController } from '../src/auth/auth.controller';
import { AuthService } from '../src/auth/auth.service';
import { Test } from '@nestjs/testing';

const moduleMocker = new ModuleMocker(global);

describe('Auth module', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {};

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
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

    service = moduleRef.get(AuthService);
    controller = moduleRef.get(AuthController);
  });

  it('controller defined', () => {
    expect(controller).toBeDefined();
  });
});
