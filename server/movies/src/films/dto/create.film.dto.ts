export class CreateFilmDto {
    kinopoiskId: number;
    nameRu: string;
    nameOriginal: string;
    posterUrl: string;
    posterUrlPreview: string;
    coverUrl: string;
    logoUrl: string;
    reviewsCount: number;
    ratingGoodReview: number;
    ratingGoodReviewVoteCount: number;
    ratingKinopoisk: string;
    ratingKinopoiskVoteCount: number;
    ratingFilmCritics: string;
    ratingFilmCriticsVoteCount: number;
    year: number;
    filmLength: string;
    slogan: string;
    description: string;
    shortDescription: string;
    type: string;
    ratimgMpaa: string;
    ratingAgeLimits: string;
    serial: boolean;
    shortFilm: boolean;
}