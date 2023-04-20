import {getByLink} from "./getByLink.js";
import * as dotenv from 'dotenv';

dotenv.config();

const linkFilm = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkBudget = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkSimilar = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const linkStaff = 'https://kinopoiskapiunofficial.tech/api/v1/staff?filmId=';
const linkPerson = 'https://kinopoiskapiunofficial.tech/api/v1/staff/';
const linkTrailer = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/'

const filmsId = [
    "1047883",
    "1236063",
    "370",
    "819101",
    "1109271",
    "493208",
    "505851",
    "571335",
    "822709",
    "8408",
    "4541",
    "841263",
    "522",
    "39577",
    "930878",
    "920265",
    "5167",
    "387556",
    "43869",
    "77044",
    "470178",
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
    let counter = 0;

    try {
        for (let filmId of filmsId) {
            counter++
            console.log(`The ${counter} ID, value: ${filmId}`);

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

    } catch (e) {
        console.log(e);
    }

}
parser(filmsId)