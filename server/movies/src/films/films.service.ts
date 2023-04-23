import {Inject, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Films} from "./films.model";
import {CountriesService} from "../countries/countries.service";
import {GenresService} from "../genres/genres.service";
import {BudgetService} from "../budget/budget.service";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";
import {Op} from "sequelize";

@Injectable()
export class FilmsService {

    constructor(
        @Inject('USERS-SERVICE') private usersClient: ClientProxy,
        @InjectModel(Films) private filmsRepository: typeof Films,
        private countriesService: CountriesService,
        private genresService: GenresService,
        private budgetService: BudgetService,
    ) {}
    async getAllFilms(params) {
        const { page, size, title } = params;
        let condition = title ? { title: { [Op.like]: `%${title}%` } }: null;
        const { limit, offset } = this.getPagination(page, size);

        return await this.filmsRepository.findAndCountAll({
            where: condition,
            offset: offset,
            limit: limit,
        });
    }

    async getFilmById(id) {
        let result = [];
        let currentCountries = [];
        let currentGenres = [];
        let currentBudget = [];
        let actorArray = [];
        let testArray = [];
        console.log('+++ ID: ', id)

        const currentFilm = await this.filmsRepository.findOne({ where: { kinopoiskId: id.id } });

        const currentCountriesId = await this.countriesService.getCountriesByFilmId(currentFilm.kinopoiskId);
        for ( let country of currentCountriesId ) {
            currentCountries.push(await this.countriesService.getCountryById(country.countryId));
        }

        const currentGenresId = await this.genresService.getGenresByFilmId(currentFilm.kinopoiskId);
        for ( let genre of currentGenresId ) {
            currentGenres.push(await this.genresService.getCountryById(genre.genreId));
        }

        const currentBudgetId = await this.budgetService.getBudgetByFilmId(currentFilm.kinopoiskId);
        for ( let budget of currentBudgetId ) {
            currentBudget.push(await this.budgetService.getBudgetById(budget.budgetId));
        }

        const currentStaff = await lastValueFrom(this.usersClient.send({ cmd : 'get-staff' }, currentFilm.kinopoiskId));

        result.push({
            film: currentFilm,
            countries: currentCountries,
            genre: currentGenres,
            budget: currentBudget,
            staff: currentStaff,
        });

        return result;
    }

    private getPagination(page, size)  {
        const limit = size ? +size : 3;
        const offset = page ? page * limit : 0;

        return { limit, offset };
    };
}
