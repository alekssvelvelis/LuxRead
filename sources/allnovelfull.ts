import { View } from 'react-native';
import cheerio from 'react-native-cheerio';

const sourceName = 'AllNovelFull';
const sourceURL = `https://allnovelfull.net`;

const fetchNovelImage = async (novelPageURL: string): Promise<string> => {
    try {
        const result = await fetch(novelPageURL);
        const body = await result.text();
        const loadedCheerio = cheerio.load(body);
        const imageSrc = loadedCheerio('.book img').attr('src');
        return `${sourceURL}${imageSrc}`;
    } catch (error) {
        console.error('Error fetching novel image:', error);
        return ''; // Return an empty string or a placeholder image URL in case of error
    }
};

const popularNovels = async (pageNumber: number) => {
    try {
        const url = `${sourceURL}/most-popular?page=${pageNumber}`;
        const result = await fetch(url);
        const body = await result.text();
        const loadedCheerio = cheerio.load(body);
        const novels = [];

        const novelList = loadedCheerio('.list .row');
        const promises = novelList.map(async (index: number, element: CheerioElement) => {
            const title = loadedCheerio(element).find('.truyen-title a').text().trim();
            const author = loadedCheerio(element).find('.author').text().trim();
            const novelPageHREF = loadedCheerio(element).find('.truyen-title a').attr('href');
            const novelPageURL = `${sourceURL}${novelPageHREF}`;

            if (title && author && novelPageURL) {
                const imageURL = await fetchNovelImage(novelPageURL);
                return {
                    title,
                    author,
                    imageURL,
                    novelPageURL,
                };
            }
        }).get(); // Convert Cheerio to array

        return Promise.all(promises).then(results => results.filter(Boolean)); // Filter out undefined values
    } catch (error) {
        console.error('Error fetching popular novels:', error);
        return [];
    }
};

const searchNovels = async (novelName: string, pageNumber: number) => {
    try {
        const url = `${sourceURL}/search?keyword=${novelName}&page=${pageNumber}`;
        const result = await fetch(url);
        const body = await result.text();
        const loadedCheerio = cheerio.load(body);
        const novels = [];

        const novelList = loadedCheerio('.list .row');
        const promises = novelList.map(async (index: number, element: CheerioElement) => {
            const title = loadedCheerio(element).find('.truyen-title a').text().trim();
            const author = loadedCheerio(element).find('.author').text().trim();
            const image = loadedCheerio(element).find('img').attr('src');
            const novelPageHREF = loadedCheerio(element).find('.truyen-title a').attr('href');
            const novelPageURL = `${sourceURL}${novelPageHREF}`;

            if (title && author && novelPageURL) {
                const imageURL = await fetchNovelImage(novelPageURL);
                return {
                    title,
                    author,
                    imageURL,
                    novelPageURL,
                };
            }
        }).get(); // Convert Cheerio to array

        return Promise.all(promises).then(results => results.filter(Boolean)); // Filter out undefined values
    } catch (error) {
        console.error('Error searching novels:', error);
        return [];
    }
};

const fetchSingleNovel = async (novelPageURL: string) => {
    try {
        const result = await fetch(novelPageURL);
        const body = await result.text();
        const loadedCheerio = cheerio.load(body);

        const image = loadedCheerio('.book img').attr('src');
        const imageURL = `${sourceURL}${image}`;
        const title = loadedCheerio('.books .title').text().trim();
        const description = loadedCheerio('.desc-text p').text().trim();
        const author = loadedCheerio('.info h3:contains("Author:")').next('a').text().trim();
        const chapterCount = loadedCheerio('.l-chapters a').text().match(/\d+/)?.[0] || '0';
        const genres = loadedCheerio('.info h3:contains("Genre:")').nextAll('a').map((i, el) => loadedCheerio(el).text().trim()).get();
        const chapters = loadedCheerio('.list-chapter li a').map((i, el) => ({
            title: loadedCheerio(el).text().trim(),
            url: `${sourceURL}${loadedCheerio(el).attr('href')}`,
        })).get();

        return {
            title,
            imageURL,
            description,
            author,
            genres,
            url: novelPageURL,
            chapters,
            chapterCount,
        };
    } catch (error) {
        console.error('Error fetching single novel:', error);
        return null;
    }
};

const fetchChapters = async (novelPageURL: string, page: number) => {
    try {
        const url = `${novelPageURL}?page=${page}`;
        const result = await fetch(url);
        const body = await result.text();
        const loadedCheerio = cheerio.load(body);

        return loadedCheerio('.list-chapter li a').map((i, el) => ({
            title: loadedCheerio(el).text().trim(),
            url: `${sourceURL}${loadedCheerio(el).attr('href')}`,
        })).get();
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
};

const fetchChapterContent = async (chapterPageURL: string) => {
    try {
        // Fetch the page content
        const url = `${chapterPageURL}`;
        const result = await fetch(url);
        const body = await result.text();
        const loadedCheerio = cheerio.load(body);

        // Initialize the object to store chapter content
        const chapterContent: { title: string; content: string[] } = {
            title: '',
            content: [],
        };

        const chapterTitle = loadedCheerio('.chapter-title').text();
        chapterContent.title = chapterTitle;
        
        loadedCheerio('#chapter-content p').each((i, el) => {
            chapterContent.content.push(loadedCheerio(el).text().trim());
        });

        return chapterContent;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return { title: '', content: [] }; // Return an empty array on error
    }
};

export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent };
