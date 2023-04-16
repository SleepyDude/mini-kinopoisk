import * as dotenv from 'dotenv'
import axios from "axios";
import fs from "fs";

dotenv.config();
axios.defaults.headers.common['X-API-KEY'] = process.env.X_API_KEY;

const linkAPI = 'https://kinopoiskapiunofficial.tech/api/v2.2/films/';
const filmsId = []

function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function test(filmsId) {
    let filmsBase = [];

    try {
        for (let id of filmsId) {
            console.log('ID: ', id)
            let film = await axios.get(`${linkAPI}${id}`);
            console.log(film.data)
            filmsBase.push(film.data);
            await delay(2000);
        }
        fs.writeFile('film.base.json', JSON.stringify(filmsBase), err => {
            if (err) throw err
            console.log('SAVED', filmsBase.length, 'АЙДИШНИКОВ')
        })
    } catch (e) {
        console.log(e)
    }
}

test(filmsId);
