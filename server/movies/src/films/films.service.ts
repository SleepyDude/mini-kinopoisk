import {Inject, Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/sequelize";
import {Films} from "./films.model";
import {CountriesService} from "../countries/countries.service";
import {GenresService} from "../genres/genres.service";
import {BudgetService} from "../budget/budget.service";
import {ClientProxy} from "@nestjs/microservices";
import {lastValueFrom} from "rxjs";

@Injectable()
export class FilmsService {

    constructor(
        @Inject('USERS-SERVICE') private usersClient: ClientProxy,
        @InjectModel(Films) private filmsRepository: typeof Films,
        private countriesService: CountriesService,
        private genresService: GenresService,
        private budgetService: BudgetService,
    ) {}
    async getAllFilms() {
        return await this.filmsRepository.findAll();
    }

    async getFilmById(id) {
        let result = [];
        let currentCountries = [];
        let currentGenres = [];
        let currentBudget = [];
        let currentStaff = [];
        `Должен вернуть:
        фильм
        страны
        жанры
        актеров`

        const currentFilm = await this.filmsRepository.findOne({ where: { kinopoiskId: id } });

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

        const currentStaffId = lastValueFrom(await this.usersClient.send({ cmd : 'get-staff' }, currentFilm.kinopoiskId));
        for ( let person of await currentStaffId ) {
            let currentPerson = await this.usersClient.send({ cmd : 'get-person-by-id' }, person.personId);
            currentStaff.push({
                    professionText: person.professionText,
                    professionKey: person.proseffionKey,
                    ...currentPerson,
                });
        }
        return result.push({
                film: currentFilm,
                countries: currentCountries,
                genre: currentGenres,
                budget: currentBudget,
                staff: currentStaff
            });
    }
}
