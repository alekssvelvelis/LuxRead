// @ts-ignore
import cheerio from 'react-native-cheerio';
import axios from 'axios';
const sourceName = 'NovelBin';
const sourceURL = `https://novelbin.com/`;

// const fetchNovelImage = async (novelPageURL: string): Promise<string> => {
//     try {
//         const result = await axios.get(novelPageURL);
//         const body = result.data;
//         const loadedCheerio = cheerio.load(body);
//         // console.log(loadedCheerio);
//         const imageElement = loadedCheerio('.book .lazy');

//         // Try to get the image URL from `data-src` or `data-original`, falling back to `src`
//         const imageSrc = imageElement.attr('data-src') || imageElement.attr('src');
//         if (!imageSrc) {
//             console.error('No valid image source found');
//             return '';
//         }
//         return `${imageSrc}`;
//     } catch (error) {
//         console.error('Error fetching novel image:', error);
//         return ''; // Return an empty string or a placeholder image URL in case of error
//     }
// };

const popularNovels = async (pageNumber: number) => {
    try {
        const url = `${sourceURL}sort/top-view-novel?page=${pageNumber}`;
        const result = await axios.get(url);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const novelList = loadedCheerio('.list .row');
        const promises = novelList.map(async (_: number, element: cheerio.Element) => { // _ used as a replacement for index, index is required by .map but not used here
            const title = loadedCheerio(element).find('.novel-title a').text().trim();
            const author = loadedCheerio(element).find('.author').text().trim();
            const chapterCountText = loadedCheerio(element).find('.text-info .chapter-title').text();
            const chapterCount = parseInt(chapterCountText.match(/\d+/)?.[0] || '0', 10);
            const novelPageURL = loadedCheerio(element).find('.novel-title a').attr('href');
            const testImageURL = loadedCheerio(element).find('img.cover').attr('data-src');
            if(!testImageURL){
                return undefined;
            }
            const imageURL = testImageURL.replace('novel_200_89', 'novel');
            if (title && author && novelPageURL) {
                // const imageURL = await fetchNovelImage(novelPageURL); 
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
        console.error('Error fetching popular novels:', error);
        return [];
    }
};

const searchNovels = async (novelName: string, pageNumber: number) => {
    try {
        const url = `${sourceURL}search?keyword=${novelName}&page=${pageNumber}`;
        console.log(url);
        const result = await axios.get(url);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);

        const novelList = loadedCheerio('.list .row');
        const promises = novelList.map(async (_: number, element: string) => {
            const title = loadedCheerio(element).find('.novel-title a').text().trim();
            const author = loadedCheerio(element).find('.author').text().trim();
            const chapterCountText = loadedCheerio(element).find('.text-info .chapter-title').text();
            const chapterCount = parseInt(chapterCountText.match(/\d+/)?.[0] || '0', 10);
            const novelPageURL = loadedCheerio(element).find('.novel-title a').attr('href');
            const baseImageURL = loadedCheerio(element).find('img.cover').attr('src');
            if(!baseImageURL){
                return;
            }
            const imageURL = baseImageURL.replace('novel_200_89', 'novel');
            if (title && author && novelPageURL) {
                // const imageURL = await fetchNovelImage(novelPageURL);
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
        }).get();

        return Promise.all(promises).then(results => results.filter(Boolean));
    } catch (error) {
        console.error('Error searching novels:', error);
        return [];
    }
};

const fetchSingleNovel = async (novelPageURL: string) => {
    try {
        const result = await axios.get(novelPageURL);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const imageElement = loadedCheerio('.book .lazy');
        const imageURL = imageElement.attr('data-src') || imageElement.attr('src');
        const title = loadedCheerio('.books .title').text().trim();
        const description = loadedCheerio('.desc-text').text().trim();
        const author = loadedCheerio('.info h3:contains("Author:")').next('a').text().trim();
        const chapterCountText = loadedCheerio('.chapter-title').text();
        const chapterCount = parseInt(chapterCountText.match(/\d+/)?.[0] || '0', 10);
        const genres = loadedCheerio('.info h3:contains("Genre:")').nextAll('a').map((_: number, el: cheerio.Element) => loadedCheerio(el).text().trim()).get();
        const novelStatus = loadedCheerio('.info h3:contains("Status:")').next('a').text().trim();

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
        console.error('Error fetching single novel:', error);
        return null;
    }
};

const fetchChapters = async (novelPageURL: string, chapterCount: number) => {
    try {
        const actualChapterCount = chapterCount-1; // lazy fix :)
        const url = `${novelPageURL}#tab-chapters-title`;
        const parts = url.split('/');
        const novelTitle = parts[parts.length - 1];
        const APIurl = `https://novelbin.com/ajax/chapter-archive?novelId=${novelTitle}`
        const result = await axios.get(APIurl);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const rowToGet = loadedCheerio('.panel-body .row').eq(actualChapterCount);
        const titlesAndHrefs = rowToGet.find('ul li a').map((index: number, el: cheerio.Element) => {
            return {
                id: index+1,
                title: loadedCheerio(el).text().trim(),
                chapterPageURL: `${loadedCheerio(el).attr('href')}`,
            };
        }).get();
        return titlesAndHrefs;
    } catch (error) {
        return {
            success: false,
            error: error, // You may return the error object if needed
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
        if (nextChapterElement.length && !nextChapterElement.hasClass('disabled')) {
            const nextChapter = nextChapterElement.attr('href');
            const nextChapterURL = `${nextChapter}`;
            if (nextChapter) {
                chapterContent.closeChapters['nextChapter'] = nextChapterURL;
            }
        }

        const prevChapterElement = loadedCheerio('#prev_chap');
        if (prevChapterElement.length && !prevChapterElement.hasClass('disabled')) {
            const prevChapter = prevChapterElement.attr('href');
            const prevChapterURL = `${sourceURL}${prevChapter}`;
            if (prevChapter) {
                chapterContent.closeChapters['prevChapter'] = prevChapterURL;
            }
        }
        return chapterContent;
    } catch (error) {
        console.error('Error fetching single chapter content:', error);
        return { title: '', content: [], closeChapters: {} };
    }
};


export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent };
