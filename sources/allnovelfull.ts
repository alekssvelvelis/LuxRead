import { View } from 'react-native';
import cheerio from 'react-native-cheerio';
const sourceName = 'AllNovelFull';
const sourceURL = `https://allnovelfull.net`;

const popularNovels = async ( pageNumber: number) =>{
    const url = `${sourceURL}/most-popular?page=${pageNumber}`;
    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);
    const novels = [];

    loadedCheerio('.list .row').each((index, element) => {
        const title = loadedCheerio(element).find('.truyen-title a').text();
        const author = loadedCheerio(element).find('.author').text().trim();
        const image = loadedCheerio(element).find('img').attr('src');
        const imageURL = `${sourceURL}${image}`

        if (!title || !author || !image) {
            return;
        }

        novels.push({
            title,
            author,
            imageURL
        });
    });

    // console.log('Novels:', JSON.stringify(novels, null, 2));
    return novels;
}

export default popularNovels;
