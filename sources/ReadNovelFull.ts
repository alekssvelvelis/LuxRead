// @ts-ignore
import cheerio from 'react-native-cheerio';
import axios from 'axios';
const sourceName = 'ReadNovelFull';
const sourceURL = `https://readnovelfull.com`;


const popularNovels = async (pageNumber: number) => {
    try {
        const url = `${sourceURL}/novel-list/hot-novel?page=${pageNumber}`;
        const result = await axios.get(url);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const novelList = loadedCheerio('.list .row');
        const promises = novelList.map(async (_: number, element: cheerio.Element) => { // _ used as a replacement for index, index is required by .map but not used here
            const title = loadedCheerio(element).find('h3.novel-title a').attr('title');
            const author = loadedCheerio(element).find('span.author').text().trim();
            const chapterCountText = loadedCheerio(element).find('.text-info .chr-text').text();
            const chapterCount = parseInt(chapterCountText.match(/\d+/)?.[0] || '0', 10);
            const novelPageURL = `${sourceURL}${loadedCheerio(element).find('.novel-title a').attr('href')}`;
            const testImageURL = loadedCheerio(element).find('img.cover').attr('src');
            // const title = loadedCheerio(element).find('img.cover').attr()
            // console.log(title, author, chapterCount, imageURL, novelPageURL, sourceName);
            if(!testImageURL){
                return undefined;
            }
            const imageURL = testImageURL.replace('t-200x89', 't-300x439');
            if (title && author && novelPageURL) {
                return {
                    title,
                    author,
                    chapterCount,
                    imageURL,
                    novelPageURL,
                    sourceName,
                };
            }
            return;
        }).get(); // Convert Cheerio to array

        return Promise.all(promises).then(results => results.filter(Boolean)); // Filter out undefined values
    } catch (error) {
        console.error(`Error fetching popular novels: ${sourceURL}`, error);
        return [];
    }
};

const searchNovels = async (novelName: string, pageNumber: number) => {
    try {
        const url = `${sourceURL}/novel-list/search?keyword=${novelName}&page=${pageNumber}`;
        const result = await axios.get(url);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const novelList = loadedCheerio('.list .row');
        const promises = novelList.map(async (_: number, element: cheerio.Element) => { // _ used as a replacement for index, index is required by .map but not used here
            const title = loadedCheerio(element).find('.novel-title a').text().trim();
            const author = loadedCheerio(element).find('span.author').text().trim();
            
            const chapterCountText = loadedCheerio(element).find('.text-info .chr-text').text();
            const chapterCount = parseInt(chapterCountText.match(/\d+/)?.[0] || '0', 10);
            const novelPageURL = `${sourceURL}${loadedCheerio(element).find('.novel-title a').attr('href')}`;
            const testImageURL = loadedCheerio(element).find('img.cover').attr('src');
            // console.log(title, author, chapterCount, imageURL, novelPageURL, sourceName);
            if(!testImageURL){
                return undefined;
            }
            const imageURL = testImageURL.replace('t-200x89', 't-300x439');
            if (title && author && novelPageURL) {
                return {
                    title,
                    author,
                    chapterCount,
                    imageURL,
                    novelPageURL,
                    sourceName,
                };
            }
            return;
        }).get(); // Convert Cheerio to array

        return Promise.all(promises).then(results => results.filter(Boolean)); // Filter out undefined values
    } catch (error) {
        console.error(`Error searching novels: ${sourceURL}`, error);
        return [];
    }
};

const fetchSingleNovel = async (novelPageURL: string) => {
    try {
        const result = await axios.get(novelPageURL);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);

        const imageURL = loadedCheerio('.book img').attr('src');
        const title = loadedCheerio('.desc h3.title').first().text().trim();
        const description = loadedCheerio('div.desc-text').text().trim();
        const author = loadedCheerio('.info h3:contains("Author:")').next('a').text().trim();
        const genres = loadedCheerio('.info h3:contains("Genre:")').nextAll('a').map((_: number, el: cheerio.Element) => loadedCheerio(el).text().trim()).get();
        const novelStatus = loadedCheerio('.info h3:contains("Status:")').next('a').text().trim();
        const chapterCountText = loadedCheerio('div.item-value a').attr('title');
        const chapterCount = parseInt(chapterCountText.match(/\d+/)?.[0] || '0', 10);
        console.log(title, description, author, genres, novelStatus, chapterCount);
        return {
            title,
            imageURL,
            description,
            author,
            genres,
            novelPageURL,
            chapterCount,
            novelStatus,
        };

    } catch (error) {
        console.error(`Error fetching single novel: ${sourceURL}`, error);
        return null;
    }
};

const fetchNovelIdForAjax = async (novelPageURL: string) => {
    const result = await axios.get(novelPageURL);
    const body = result.data;
    const loadedCheerio = cheerio.load(body);
    return loadedCheerio('#rating').attr('data-novel-id');
}

const fetchChapters = async (novelPageURL: string, chapterCount: number) => {
    try {
        const novelId = await fetchNovelIdForAjax(novelPageURL);
        const actualChapterCount = chapterCount-1; // lazy fix :)
        const APIurl = `${sourceURL}/ajax/chapter-archive?novelId=${novelId}`;
        const result = await axios.get(APIurl);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const rowToGet = loadedCheerio('.panel-body .row').eq(actualChapterCount);
        const titlesAndHrefs = rowToGet.find('ul li a').map((index: number, el: cheerio.Element) => {
            return {
                id: index+1,
                title: loadedCheerio(el).text().trim(),
                chapterPageURL: `${sourceURL}${loadedCheerio(el).attr('href')}`,
            };
        }).get();
        return titlesAndHrefs;
    } catch (error) {
        return {
            success: false,
            error: error,
        };
    }
};

const fetchChapterContent = async (chapterPageURL: string) => {
    try {
        const url = `${chapterPageURL}`;
        const result = await axios.get(url);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);

        interface ChapterContent {
            title: string;
            content: string[];
            closeChapters: { [chapterTitle: string]: string};
        }

        const chapterContent: ChapterContent = {
            title: '',
            content: [],
            closeChapters: {},
        };

        const chapterTitle = loadedCheerio('.chr-title').text();
        chapterContent.title = chapterTitle;

        loadedCheerio('#chr-content p').each((_: number, el: cheerio.Element) => {
            chapterContent.content.push(loadedCheerio(el).text().trim());
        });

        const nextChapterElement = loadedCheerio('#next_chap');
        if (nextChapterElement.length && !nextChapterElement.is('[disabled]')) {
            const nextChapter = nextChapterElement.attr('href');
            const nextChapterURL = `${sourceURL}${nextChapter}`;
            if (nextChapter) {
                chapterContent.closeChapters['nextChapter'] = nextChapterURL;
            }
        }

        const prevChapterElement = loadedCheerio('#prev_chap');
        if (prevChapterElement.length && !prevChapterElement.is('[disabled]')) {
            const prevChapter = prevChapterElement.attr('href');
            const prevChapterURL = `${sourceURL}${prevChapter}`;
            if (prevChapter) {
                chapterContent.closeChapters['prevChapter'] = prevChapterURL;
            }
        }
        
        return chapterContent;
    } catch (error) {
        console.error(`Error fetching single chapter content: ${sourceURL}`, error);
        return { title: '', content: [], closeChapters: {} };
    }
};


export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent };
