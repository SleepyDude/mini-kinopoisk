import { MockFunctionMetadata, ModuleMocker } from 'jest-mock';
import { Test } from '@nestjs/testing';
import { ReviewsController } from '../src/reviews/reviews.controller';
import { ReviewsService } from '../src/reviews/reviews.service';

const moduleMocker = new ModuleMocker(global);

describe('reviews module', () => {
  let service: ReviewsService;
  let controller: ReviewsController;
  let reviewsData1;
  let reviewsData2;

  const mockReviewsService = {
    createReview: jest.fn().mockImplementation((reviewsData) => {
      return {
        id: Date.now(),
        ...reviewsData,
      };
    }),

    deleteReview: jest.fn(() => {
      return [];
    }),

    getReviewsByFilmId: jest.fn(() => {
      return { reviewsData1, reviewsData2 };
    }),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [ReviewsService],
    })
      .useMocker((token) => {
        const results = ['test1', 'test2'];
        if (token === ReviewsService) {
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
      .overrideProvider(ReviewsService)
      .useValue(mockReviewsService)
      .compile();

    reviewsData1 = {
      name: 'Some name1',
      text: 'text1',
    };
    reviewsData2 = {
      name: 'Some name2',
      text: 'text2',
    };

    service = moduleRef.get(ReviewsService);
    controller = moduleRef.get(ReviewsController);
  });

  it('controller defined', () => {
    expect(controller).toBeDefined();
  });

  it('Check create service', async () => {
    expect(await controller.createReview(reviewsData1)).toEqual({
      id: expect.any(Number),
      ...reviewsData1,
    });
    const spyCreateReview = jest.spyOn(service, 'createReview');
    expect(spyCreateReview).toBeCalledTimes(1);
  });

  it('Check delete review service', async () => {
    expect(await controller.deleteReview(1)).toEqual([]);
    const spyDeleteReview = jest.spyOn(service, 'deleteReview');
    expect(spyDeleteReview).toBeCalledTimes(1);
  });

  it('Check get reviews by film id', async () => {
    expect(await controller.getReviewsByFilmId(1)).toEqual({
      reviewsData1,
      reviewsData2,
    });
    const spyGetReviews = jest.spyOn(service, 'getReviewsByFilmId');
    expect(spyGetReviews).toBeCalledTimes(1);
  });
});
