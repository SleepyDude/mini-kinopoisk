import {getByLink} from "./getByLink.js";
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const linkFilm = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkBudget = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkSimilar = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkStaff = 'https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=';
const linkPerson = 'https://kinopoiskapiunofficial.tech/api/v1/staff/';
const linkTrailer = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/'

const filmsId = [
    "3498",
    "407636",
    "104992",
    "5928",
    "804662",
    "1224067",
    "102124",
    "312",
    "88173",
    "4647040",
    "404900",
    "4542208",
    "1392743",
    "5078983",
    "278522",
    "45319",
    "88198",
    "526",
    "478491",
    "591929",
    "44168",
]

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parser(filmsId) {
    let filmBase = [];
    let budgetBase = [];
    let similarBase = [];
    let trailerBase = [];
    let staffBase = [];
    let actorsBase = [];

    try {
        for (let filmId of filmsId) {
            console.log('ID: ', filmId);

            let currentFilm = await getByLink(`${linkFilm}${filmId}`, process.env.X_API_KEY, 1000);
            let currentBudget = await getByLink(`${linkBudget}${filmId}/box_office`, process.env.X_API_KEY, 1000);
            let currentSimilarFilms = await getByLink(`${linkSimilar}${filmId}/similars`, process.env.X_API_KEY, 1000);
            let currentTrailer = await getByLink(`${linkTrailer}${filmId}/videos`, process.env.X_API_KEY, 1000);
            let currentStaff = await getByLink(`${linkStaff}${filmId}`, process.env.X_API_KEY, 1000);

            filmBase.push(currentFilm);
            budgetBase.push({filmId: filmId, ...currentBudget});
            similarBase.push({filmId: filmId, ...currentSimilarFilms});
            trailerBase.push({filmId: filmId, ...currentTrailer});
            staffBase.push({filmId: filmId, ...currentStaff});

            for (let person of currentStaff) {
                console.log('PERSON: ', person)
                await delay(1000)
                let currentPerson = await getByLink(`${linkPerson}${person.staffId}`, process.env.X_API_KEY);
                if ( actorsBase.find(actor => actor.personId === currentPerson.personId) ) {
                    continue;
                }
                actorsBase.push(currentPerson);
            }

        }

        await fs.writeFile('filmBase.json', JSON.stringify(filmBase), err => {
            if (err) throw err
            console.log('SAVED', filmBase.length, 'Фильмов')
        });

        await fs.writeFile('budgetBase.json', JSON.stringify(budgetBase), err => {
            if (err) throw err
            console.log('SAVED', budgetBase.length, 'Бюджета')
        });

        await fs.writeFile('similarBase.json', JSON.stringify(similarBase), err => {
            if (err) throw err
            console.log('SAVED', similarBase.length, 'Зависимостей')
        });

        await fs.writeFile('trailerBase.json', JSON.stringify(trailerBase), err => {
            if (err) throw err
            console.log('SAVED', trailerBase.length, 'Трейлеров')
        });

        await fs.writeFile('staffBase.json', JSON.stringify(staffBase), err => {
            if (err) throw err
            console.log('SAVED', staffBase.length, 'персонала')
        });

        await fs.writeFile('actorBase.json', JSON.stringify(actorsBase), err => {
            if (err) throw err
            console.log('SAVED', actorsBase.length, 'актеров')
        });

    } catch (e) {

        await fs.writeFile('filmBase.json', JSON.stringify(filmBase), err => {
            if (err) throw err
            console.log('SAVED', filmBase.length, 'Фильмов')
        });

        await fs.writeFile('budgetBase.json', JSON.stringify(budgetBase), err => {
            if (err) throw err
            console.log('SAVED', budgetBase.length, 'Бюджета')
        });

        await fs.writeFile('similarBase.json', JSON.stringify(similarBase), err => {
            if (err) throw err
            console.log('SAVED', similarBase.length, 'Зависимостей')
        });

        await fs.writeFile('trailerBase.json', JSON.stringify(trailerBase), err => {
            if (err) throw err
            console.log('SAVED', trailerBase.length, 'Трейлеров')
        });

        await fs.writeFile('staffBase.json', JSON.stringify(staffBase), err => {
            if (err) throw err
            console.log('SAVED', staffBase.length, 'персонала')
        });

        await fs.writeFile('actorBase.json', JSON.stringify(actorsBase), err => {
            if (err) throw err
            console.log('SAVED', actorsBase.length, 'актеров')
        });

        console.log(e);
    }

}
parser(filmsId)