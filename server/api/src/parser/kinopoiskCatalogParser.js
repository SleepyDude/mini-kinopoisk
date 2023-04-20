import * as fs from "fs";
import puppeteer from "puppeteer";

const catalogLink = 'https://www.kinopoisk.ru/lists/movies/?page=';

async function catalogParser() {
    let catalog = [];
    let pagesCounter = 1;
    let maxPage = 80;

    try {
        let browser = await puppeteer.launch({
            headless: false,
            slowMo: 100,
            devtools: true
        })

        let catalogPage = await browser.newPage();
        await catalogPage.setViewport({
            width: 1400, height: 900
        })

        while ( pagesCounter <= maxPage ) {
            await catalogPage.goto(`${catalogLink}${pagesCounter}`);
            await catalogPage.waitForSelector('a.styles_start__UvE6T');

            let catalogHtml = await catalogPage.evaluate(async () => {
                let page = [];

                try {
                    let divs = document.querySelectorAll('div.styles_root__ti07r')

                    divs.forEach( div => {
                        let filmId = div.querySelector('a.base-movie-main-info_link__YwtP1').href.split('/')[4];
                        page.push(filmId)
                    });

                } catch (e) {
                    console.log(e);
                }
                return page;

            }, {waitUntill: 'styles_start__UvE6T'});

            catalog.push(catalogHtml);
        pagesCounter++
        }

        fs.writeFile('kinopoisk.id.json', JSON.stringify({ 'data': catalog }), err => {
            if(err) throw err
            console.log('SAVED', catalog.length * 50, 'АЙДИШНИКОВ');
        })
        await browser.close();
    } catch (e) {
        console.log(e);
    }
}

catalogParser();
