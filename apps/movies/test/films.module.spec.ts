import { FilmsController } from '../src/films/films.controller';
import { Test } from '@nestjs/testing';
import { FilmsService } from '../src/films/films.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { HttpStatus } from '@nestjs/common';

const moduleMocker = new ModuleMocker(global);

describe('films module', () => {
  let controller: FilmsController;
  let service: FilmsService;
  let obj1;
  let obj2;

  const mockFilmsService = {
    getAllFilms: jest.fn(() => {
      return { obj1, obj2 };
    }),

    getFilmById: jest.fn().mockImplementation((id) => {
      if (id == obj1.id) {
        return obj1;
      }
      if (id == obj2.id) {
        return obj2;
      } else {
        return HttpStatus.NOT_FOUND;
      }
    }),

    getFilmsByIdPrevious: jest.fn(() => {
      return obj1;
    }),

    getFilmsByFilers: jest.fn(() => {
      return obj2;
    }),

    filmsAutosagest: jest.fn(() => {
      return { obj1, obj2 };
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [FilmsController],
      providers: [FilmsService],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        if (token === FilmsService) {
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
      .overrideProvider(FilmsService)
      .useValue(mockFilmsService)
      .compile();

    obj1 = {
      id: 1,
      name: 'film1',
    };
    obj2 = {
      id: 2,
      name: 'film2',
    };

    service = moduleRef.get(FilmsService);
    controller = moduleRef.get(FilmsController);
  });

  it('controller defined', () => {
    expect(controller).toBeDefined();
  });

  it('Check get all films service', async () => {
    expect(await controller.getAllFilms({})).toEqual({ obj1, obj2 });
    const spyServiceGetAllFilm = jest.spyOn(service, 'getAllFilms');
    expect(spyServiceGetAllFilm).toBeCalledTimes(1);
  });

  it('Check get film by id service', async () => {
    expect(await controller.getFilmById(1)).toEqual(obj1);
    expect(await controller.getFilmById(2)).toEqual(obj2);
    expect(await controller.getFilmById(3)).toEqual(HttpStatus.NOT_FOUND);
    const spyServiceGetFilmById = jest.spyOn(service, 'getFilmById');
    expect(spyServiceGetFilmById).toBeCalledTimes(3);
  });

  it('Check previous films service', async () => {
    expect(await controller.getFilmsByIdPrevious(1)).toEqual(obj1);
    const spyServicePreviousFilms = jest.spyOn(service, 'getFilmsByIdPrevious');
    expect(spyServicePreviousFilms).toBeCalledTimes(1);
  });

  it('Check filter service', async () => {
    expect(await controller.getFilmsByFilters(1)).toEqual(obj2);
    const spyServiceFiltersFilms = jest.spyOn(service, 'getFilmsByFilers');
    expect(spyServiceFiltersFilms).toBeCalledTimes(1);
  });

  it('Check filmsAutosagest service', async () => {
    expect(await controller.filmsAutosagest('f')).toEqual({ obj1, obj2 });
    expect(await controller.filmsAutosagest('fi')).toEqual({ obj1, obj2 });
    const spyServiceAutosagestFilms = jest.spyOn(service, 'filmsAutosagest');
    expect(spyServiceAutosagestFilms).toBeCalledTimes(2);
  });
});
