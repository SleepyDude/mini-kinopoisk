import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config()

import { Sequelize } from 'sequelize-typescript';
import { BudgetFilms } from './models/budget.m2m.model';
import { Budget } from './models/budget.model';
import { CountriesFilms } from './models/countries.m2m.model';
import { Countries } from './models/countries.model';
import { Films } from './models/films.model';
import { SimilarFilms } from './models/films.similar.m2m.model';
import { GenresFilms } from './models/genres.m2m.model';
import { Genres } from './models/genres.model';
import { Persons } from './models/persons.model';
import { PersonsFilms } from './models/persons.staff.m2m.model';
import { Trailers } from './models/trailers.model';

const sequelize = new Sequelize({
  database: 'movies',
  dialect: 'postgres',
  username: 'postgres',
  password: 'postgres',
  host: 'localhost',
  port: 5436,
  models: [Films, Trailers, Countries, CountriesFilms, Genres, GenresFilms, Budget, BudgetFilms, SimilarFilms, Persons, PersonsFilms],
  logging: false, // чтобы терминал не забивался логами SQL запросов
});

const linkFilm = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkBudget = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkSimilar = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkStaff = 'https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=';
const linkTrailer = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkPerson = 'https://kinopoiskapiunofficial.tech/api/v1/staff/';

function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getByLink(linkApi: string, ms = 100) {
    axios.defaults.headers.common['X-API-KEY'] = process.env.X_API_KEY;
    try {
        await delay(ms)
        return (await axios.get(linkApi)).data;
    } catch (e) {
        console.log(`Error processing link ${linkApi}\n${JSON.stringify(e)}`)
    }
}

let counter = 0;

const filmsId = [
    "535341"
]

async function processFilm(filmKinopId: string): Promise<any> {
    console.log(`[Film] Получаем фильм по id: ${filmKinopId}`);
    // Получаем фильм по айди
    let currentFilm = await getByLink(`${linkFilm}${filmKinopId}`, 2000);
    // записываем фильм в базу
    const film = new Films(currentFilm);
    film.save();
    console.log(`[Film] id фильма в базе: ${film.id}`);
    return currentFilm;
}

async function processTrailer(filmKinopId: string) {
    // получаем трейлер по фильм айди
    console.log(`[Trailer] Получаем трейлер`);
    let currentTrailer = await getByLink(`${linkTrailer}${filmKinopId}/videos`, 2000);
    // записываем трейлер в базу
    const trailer = new Trailers({filmId: filmKinopId, ...currentTrailer});
    trailer.save();
}

async function processCountries(filmKinopId: string, filmData: { countries: Array<{filmId: number, country: string}> }) {
    console.log(`[countries] Перебираем страны`);
    const countries = [];
    for (let country of filmData.countries) {
        // пушим страны с айди фильма в массив
        countries.push({filmId: +filmKinopId, country: country.country})
    }
    console.log(`[countries] Записываем страны в базу`);
    for (const country of countries) {
        let isCountry = await Countries.findOne({ where: { countryNameRu: country.country } });
        if (isCountry) {
            await CountriesFilms.create({kinopoiskFilmId: country.filmId, countryId: isCountry.id});
            continue;
        }
        let currentCountry = new Countries({countryNameRu: country.country});
        await CountriesFilms.create({kinopoiskFilmId: country.filmId, countryId: currentCountry.id});
    }
}

async function processGenres(filmKinopId: string, filmData: {genres: Array<any>}) {
    console.log(`[genres] Перебираем жанры`);
    //перебор жанров
    const genres = new Array<{filmId: number, genre: string}>;
    for (let genre of filmData.genres) {
        // пушим жанры
        genres.push({filmId: +filmKinopId, genre: genre.genre})
    }

    //отправляем массив жанров на запись
    for ( let genre of genres ) {
        const isGenre = await Genres.findOne({ where: { genreNameRu: genre.genre } });
        if ( isGenre ) {
            await GenresFilms.create({ kinopoiskFilmId: genre.filmId, genreId: isGenre.id });
            continue;
        }
        const currentGenre = new Genres({ genreNameRu: genre.genre });
        await GenresFilms.create({ kinopoiskFilmId: genre.filmId, genreId: currentGenre.id });
    }
}

async function processBudget(filmKinopId: string) {
    console.log(`[budgets] Достаем бюджеты`);
    
    let budget = await getByLink(`${linkBudget}${filmKinopId}/box_office`, 2000);
    // записываем бюджеты в БД
    // ОСТОРОЖНО! В оригинале перебирался массив бюджетов, но отправлялся один объект, делаю так же
    let currentBudget = new Budget(budget);
    await BudgetFilms.create({ kinopoiskFilmId: +filmKinopId, budgetId: currentBudget.id });
}

async function films_createSimilar(similar: {currentFilmId: number, items: Array<{filmId: number}>}) {
    for ( let item of similar.items ) {
        await SimilarFilms.create({ kinopoiskId: similar.currentFilmId, similarFilmId: item.filmId });
    }
}

async function processRelatedFilms(filmKinopId: string) {
    // получаем зависимые фильмы
    console.log(`[similar] Получаем похожие фильмы`);
    let currentSimilarFilmsData = await getByLink(`${linkSimilar}${filmKinopId}/similars`, 2000);
    // записываем в БД
    await films_createSimilar({currentFilmId: +filmKinopId, ...currentSimilarFilmsData});
}

async function persons_createStaff(staff: {filmId: number, items: Array<{ staffId: number, professionText: string, professionKey: string }>}) {
    for ( let person of staff.items ) {
        await PersonsFilms.create({
            kinopoiskFilmId: staff.filmId,
            personId: person.staffId,
            professionText: person.professionText,
            professionKey: person.professionKey,
        });
    }
}

async function processPersons(filmKinopId: string) {
    // Запрашиваем стафф к фильму
    console.log(`[staff] Получаем персонал фильма`);
    let currentStaffData = await getByLink(`${linkStaff}${filmKinopId}`, 2000);
    // добавление в таблицу зависимостей
    console.log(`[staff] Создаем связи персонала и фильма`);
    await persons_createStaff({
        filmId: +filmKinopId,
        items: currentStaffData
    });
    console.log(`[staff] Создаем персон персонала`);
    //перебираем полученный состав к фильму
    for (let person of currentStaffData) {
        console.log('АКТЕРЫ: ', person.staffId);
        await delay(2000);
        // получаем персонажа
        let currentPersonData = await getByLink(`${linkPerson}${person.staffId}`, 2000);
        // отправляем на запись
        if ( !await Persons.findOne({ where: { personId: currentPersonData.personId } })) {
            await Persons.create(currentPersonData);
        }
    }
}

async function processFilms() {
    for (let filmKinopId of filmsId) {
        counter++
        console.log(`Номер : ${counter} ID : ${filmKinopId}`)
    
        const filmData = await processFilm(filmKinopId);

        const trailerDbId = await processTrailer(filmKinopId);

        await processCountries(filmKinopId, filmData);

        await processGenres(filmKinopId, filmData);

        await processBudget(filmKinopId);

        await processRelatedFilms(filmKinopId);

        await processPersons(filmKinopId);

    }
}

processFilms().then( (res) => {
    console.log(`res from processFilms: ${res}`);
}).catch( (error) => {
    console.log(`error from processFilms: ${error}`);
})



