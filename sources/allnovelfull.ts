import { View } from 'react-native';
import cheerio from 'react-native-cheerio';
const sourceName = 'AllNovelFull';
const sourceURL = `https://allnovelfull.net`;

const popularNovels = async ( pageNumber: number) =>{
    const url = `${sourceURL}/most-popular` 
    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);
    console.log(loadedCheerio);
    const title = loadedCheerio('.title-list h2').text()
    console.log('title', title);

}

export default popularNovels;
