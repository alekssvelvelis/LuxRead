// @ts-ignore
import cheerio from 'react-native-cheerio';
import axios from 'axios';
const sourceName = 'AllNovelFull';
const sourceURL = `https://allnovelfull.blog`;

const fetchNovelImage = async (novelPageURL: string): Promise<string> => {
    try {
        const result = await axios.get(novelPageURL);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        // console.log(loadedCheerio);
        const imageElement = loadedCheerio('.book .lazy');

        // Try to get the image URL from `data-src` or `data-original`, falling back to `src`
        const imageSrc = imageElement.attr('data-src') || imageElement.attr('src');
        if (!imageSrc) {
            console.error('No valid image source found');
            return '';
        }
        return `${imageSrc}`;
    } catch (error) {
        console.error('Error fetching novel image:', error);
        return ''; // Return an empty string or a placeholder image URL in case of error
    }
};

const popularNovels = async (pageNumber: number) => {
    try {
        const url = `${sourceURL}/sort/all-novel-full-popular?page=${pageNumber}`;
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
            if (title && author && novelPageURL) {
                const imageURL = await fetchNovelImage(novelPageURL); 
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
        const url = `${sourceURL}/search?keyword=${novelName}&page=${pageNumber}`;
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

            if (title && author && novelPageURL) {
                const imageURL = await fetchNovelImage(novelPageURL);
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

        return {
            title,
            imageURL,
            description,
            author,
            genres,
            url: novelPageURL,
            chapterCount,
            // chapters,
        };
    } catch (error) {
        console.error('Error fetching single novel:', error);
        return null;
    }
};

const fetchChapters = async (novelPageURL: string, page: number) => {
    try {
        const url = `${novelPageURL}?page=${page}`;
        const result = await axios.get(url);
        const body = result.data;
        const loadedCheerio = cheerio.load(body);

        return loadedCheerio('.list-chapter li a').map((_: number, el: cheerio.Element) => ({
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

        const chapterTitle = loadedCheerio('.chapter-title').text();
        chapterContent.title = chapterTitle;

        loadedCheerio('#chapter-content p').each((_: number, el: cheerio.Element) => {
            chapterContent.content.push(loadedCheerio(el).text().trim());
        });

        // Add next chapter
        const nextChapterElement = loadedCheerio('#next_chap');
        if (nextChapterElement.length && !nextChapterElement.hasClass('disabled')) {
            const nextChapter = nextChapterElement.attr('href');
            const nextChapterURL = `${sourceURL}${nextChapter}`;
            if (nextChapter) {
                chapterContent.closeChapters['nextChapter'] = nextChapterURL;
            }
        }

        // Add previous chapter
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
        console.error('Error fetching chapters:', error);
        return { title: '', content: [], closeChapters: {} };
    }
};


export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent };
