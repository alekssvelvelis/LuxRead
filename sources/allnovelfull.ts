import { View } from 'react-native';
import cheerio from 'react-native-cheerio';

const sourceName = 'AllNovelFull';
const sourceURL = `https://allnovelfull.net`;

const fetchNovelImage = async (novelPageURL: string) => {
    const url = `${novelPageURL}`;
    const result = await fetch(url);
    const body = await result.text();
    const loadedCheerio = cheerio.load(body);
    const imageURL = `${sourceURL}${loadedCheerio('.book img').attr('src')}`;
    return imageURL;
};

const popularNovels = async (pageNumber: number) => {
    const url = `${sourceURL}/most-popular?page=${pageNumber}`;
    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);
    const novels = [];

    // Array to hold promises for each novel's image fetching
    const promises = [];

    const novelList = loadedCheerio('.list .row').each((index, element) => {
        const title = loadedCheerio(element).find('.truyen-title a').text();
        const author = loadedCheerio(element).find('.author').text().trim();
        const novelPageHREF = loadedCheerio(element).find('.truyen-title a').attr('href');
        const novelPageURL = `${sourceURL}${novelPageHREF}`;

        // Only push novels that have both a title and an author
        if (!title || !author || !novelPageURL) {
            return 'Error getting popular novels';
        }

        // Create a promise for the novel's image fetching
        const imagePromise = fetchNovelImage(novelPageURL).then(imageURL => {
            novels.push({
                title,
                author,
                imageURL,
                novelPageURL,
            });
        });

        // Add the promise to the array
        promises.push(imagePromise);
    });

    // Wait for all image fetching promises to resolve
    await Promise.all(promises);

    return novels;
};


const searchNovels = async (novelName: string, pageNumber: number) => {
    const url = `${sourceURL}/search?keyword=${novelName}&page=${pageNumber}`;
    const result = await fetch(url);
    const body = await result.text();

    const loadedCheerio = cheerio.load(body);
    const novels = [];

    const promises = [];

    const novelList = loadedCheerio('.list .row').each((index, element) => {
        const title = loadedCheerio(element).find('.truyen-title a').text();
        const author = loadedCheerio(element).find('.author').text().trim();
        const image = loadedCheerio(element).find('img').attr('src');
        const imageURL = `${sourceURL}${image}`;
        const novelPageHREF = loadedCheerio(element).find('.truyen-title a').attr('href');
        const novelPageURL = `${sourceURL}${novelPageHREF}`;

        if (!title || !author || !novelPageURL) {
            return 'No novel found with this title';
        }

        const imagePromise = fetchNovelImage(novelPageURL).then(imageURL => {
            novels.push({
                title,
                author,
                imageURL,
                novelPageURL,
            });
        });
        promises.push(imagePromise);
    });

    await Promise.all(promises);

    return novels;// Remember to return the novels array
};

const fetchSingleNovel = async (novelPageURL: string) => {
    const url = `${novelPageURL}`;
    const result = await fetch(url);
    const body = await result.text();
    const loadedCheerio = cheerio.load(body);

    const image = loadedCheerio('.book img').attr('src');
    const imageURL = `${sourceURL}${image}`;
    const title = loadedCheerio('.books .title').text();
    const description = loadedCheerio('.desc-text p').text();
    const author = loadedCheerio('.info h3:contains("Author:")').next('a').text();
    const chapterCount = loadedCheerio('.l-chapters a').text().match(/\d+/)[0];
    console.log(chapterCount+ ' inside of base function');
    const genres = [];
    loadedCheerio('.info h3:contains("Genre:")').nextAll('a').each((index, element) => {
        genres.push(loadedCheerio(element).text());
    });

    const chapters = [];
    const chapterElements = loadedCheerio('.list-chapter li a');
    chapterElements.each((index, element) => {
        const chapterTitle = loadedCheerio(element).text();
        const chapterURL = `${sourceURL}${loadedCheerio(element).attr('href')}`;

        chapters.push({
            title: chapterTitle,
            url: chapterURL,
        });
    });

    const novelObject = {
        title,
        imageURL,
        description,
        author,
        genres,
        url,
        chapters,
        chapterCount,
    };
    return novelObject;
}

const fetchChapters = async (novelPageURL: string, page: number = 1) => {
    const url = `${novelPageURL}?page=${page}`; // Assuming the page URL follows this pattern
    const result = await fetch(url);
    const body = await result.text();
    const loadedCheerio = cheerio.load(body);

    const chapters = [];
    const chapterElements = loadedCheerio('.list-chapter li a');
    chapterElements.each((index, element) => {
        const chapterTitle = loadedCheerio(element).text();
        const chapterURL = `${sourceURL}${loadedCheerio(element).attr('href')}`;

        chapters.push({
            title: chapterTitle,
            url: chapterURL,
        });
    });

    return chapters;
};

export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters };
