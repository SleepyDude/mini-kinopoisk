import { Genres } from '../../genres/genres.model';
import { Countries } from '../../countries/countries.model';

export const filterFilmsAttributes = [
  'id',
  'kinopoiskId',
  'nameRu',
  'nameOriginal',
  'ratingKinopoiskVoteCount',
  'posterUrl',
  'posterUrlPreview',
  'coverUrl',
  'logoUrl',
  'ratingKinopoisk',
  'year',
  'filmLength',
  'type',
];

export const allFilmsAttributes = [
  'kinopoiskId',
  'nameRu',
  'nameOriginal',
  'posterUrl',
  'posterUrlPreview',
  'coverUrl',
  'logoUrl',
  'ratingKinopoisk',
  'year',
  'filmLength',
];
export const previousFilmsAttributes = [
  'kinopoiskId',
  'year',
  'nameRu',
  'nameOriginal',
  'posterUrl',
  'posterUrlPreview',
  'coverUrl',
  'logoUrl',
  'ratingKinopoisk',
];

export const autosagestFilmsAttributes = [
  'kinopoiskId',
  'nameRu',
  'nameOriginal',
  'year',
];

export const oneFilmAttributes = {
  exclude: [
    'reviewsCount',
    'ratingGoodReview',
    'ratingGoodReviewVoteCount',
    'ratingFilmCritics',
    'ratingFilmCriticsVoteCount',
    'serial',
    'shortFilm',
    'createdAt',
    'updatedAt',
  ],
};

export const includeGenresAttributes = {
  model: Genres,
  attributes: ['id', 'genreNameRu', 'genreNameEng'],
};

export const includeCountriesAttributes = {
  model: Countries,
  attributes: ['id', 'countryNameRu', 'countryNameEng'],
};

export const includeOneFilmAttributes = [
  { all: true, attributes: { exclude: ['createdAt', 'updatedAt'] } },
];
