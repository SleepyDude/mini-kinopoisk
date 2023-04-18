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
    "535341",
    "1143242",
    "462682",
    "1318972",
    "41519",
    "8124",
    "251733",
    "447301",
    "326",
    "435",
    "42664",
    "775276",
    "464963",
    "4374",
    "1188529",
    "689",
    "258687",
    "41520",
    "361",
    "448",
    "42782",
    "685246",
    "1108577",
    "45146",
    "397667",
    "843649",
    "1100777",
    "2213",
    "463634",
    "843650",
    "820638",
    "5079093",
    "342",
    "689066",
    "409600",
    "409424",
    "462606",
    "301",
    "111543",
    "89514",
    "263531",
    "46483",
    "839954",
    "324",
    "586397",
    "44386",
    "430",
    "2360",
    "462360",
    "46225",
    "679486",
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
            similarBase.push(currentSimilarFilms);
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