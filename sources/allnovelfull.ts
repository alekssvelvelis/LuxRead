import { View } from 'react-native';
import cheerio from 'react-native-cheerio';

const sourceName = 'AllNovelFull';
const sourceURL = `https://allnovelfull.net`;

const popularNovels = async (pageNumber: number) => {
    const url = `${sourceURL}/most-popular?page=${pageNumber}`;
    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);
    const novels = [];

    loadedCheerio('.list .row').each((index, element) => {
        const title = loadedCheerio(element).find('.truyen-title a').text();
        const author = loadedCheerio(element).find('.author').text().trim();
        const image = loadedCheerio(element).find('img').attr('src');
        const imageURL = `${sourceURL}${image}`;

        if (!title || !author || !image) {
            return;
        }

        novels.push({
            title,
            author,
            imageURL
        });
    });
    
    return novels;
};

const searchNovels = async (novelName: string, pageNumber: number) => {
    const url = `${sourceURL}/search?keyword=${novelName}&page=${pageNumber}`;
    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);
    const novels = [];

    loadedCheerio('.list .row').each((index, element) => {
        const title = loadedCheerio(element).find('.truyen-title a').text();
        const author = loadedCheerio(element).find('.author').text().trim();
        const image = loadedCheerio(element).find('img').attr('src');
        const imageURL = `${sourceURL}${image}`;

        if (!title || !author || !image) {
            return 'No novel found with this title';
        }

        novels.push({
            title,
            author,
            imageURL
        });
    });

    return novels; // Remember to return the novels array
};

export { popularNovels, searchNovels };
