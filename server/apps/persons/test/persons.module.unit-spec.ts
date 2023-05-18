import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { PersonsController } from '../src/persons/persons.controller';
import { PersonsService } from '../src/persons/persons.service';

const moduleMocker = new ModuleMocker(global);

describe('persons module', () => {
  let service: PersonsService;
  let controller: PersonsController;
  let obj1;
  let obj2;

  const mockPersonsService = {
    getPersonById: jest.fn(() => {
      return obj1;
    }),

    getAllPersons: jest.fn(() => {
      return { obj1, obj2 };
    }),

    getPersonsAutosagest: jest.fn(() => {
      return obj1.name;
    }),

    getStaffByFilmId: jest.fn(() => {
      return obj1;
    }),

    getFilmsIdByPersonId: jest.fn(() => {
      return obj1;
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [PersonsController],
      providers: [PersonsService],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        if (token === PersonsService) {
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
      .overrideProvider(PersonsService)
      .useValue(mockPersonsService)
      .compile();

    obj1 = {
      name: 'тест',
      nameEng: 'test',
    };
    obj2 = {
      name: 'тест2',
      nameEng: 'test2',
    };

    service = moduleRef.get(PersonsService);
    controller = moduleRef.get(PersonsController);
  });

  it('controller defined', () => {
    expect(controller).toBeDefined();
  });

  it('check service get person by id', async () => {
    expect(await controller.getPersonById(1)).toEqual(obj1);
    const spyService = jest.spyOn(service, 'getPersonById');
    expect(spyService).toBeCalledTimes(1);
  });

  it('check service get all persons', async () => {
    expect(await controller.getAllPersons({})).toEqual({ obj1, obj2 });
    const spyService = jest.spyOn(service, 'getAllPersons');
    expect(spyService).toBeCalledTimes(1);
  });

  it('check service get persons autosagest', async () => {
    expect(
      await controller.getPersonsAutosagest({
        profession: 'test',
        name: 'test',
      }),
    ).toEqual(obj1.name);
    const spyService = jest.spyOn(service, 'getPersonsAutosagest');
    expect(spyService).toBeCalledTimes(1);
  });

  it('check service get staff by film id', async () => {
    expect(await controller.getStaffByFilmId({ id: 1 })).toEqual(obj1);
    const spyService = jest.spyOn(service, 'getStaffByFilmId');
    expect(spyService).toBeCalledTimes(1);
  });

  it('check service get films id by person id', async () => {
    expect(await controller.getFilmsIdByPersonId({ id: 1 })).toEqual(obj1);
    const spyService = jest.spyOn(service, 'getFilmsIdByPersonId');
    expect(spyService).toBeCalledTimes(1);
  });
});
