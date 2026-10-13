import * as cheerio from 'cheerio';
import { fetchHtml } from '@/utils/axios';
const sourceName = 'AllNovelFull';
const sourceURL = `https://allnovelfull.net`;

const fetchNovelImage = async (novelPageURL: string): Promise<string> => {
    try {
        const result = await fetchHtml(novelPageURL);
        const body = result.data;
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
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

        const novelList = $('.ul-list1 .li-row');
        const data = novelList.map((index: number, element: cheerio.Element) => {
            const title = $(element).find('h3.tit a').attr('title');
            const author = $(element).find().text().trim();
            const imageURL = `${sourceURL}${$(element).find('.pic a img').attr('src')}`;
            const chapterCount = $(element).find('a.chapter').attr('title');
            const novelPageURL = $(element).find('.pic a').attr('href');
            const sourceName = `${sourceURL}${novelPageURL}`;
            // console.log($(element).find('h3.tit a').attr("title"));
            return {
                title,
                author,
                chapterCount,
                imageURL,
                novelPageURL,
                sourceName
            }
        }).get();
        // console.log(data);
        return data;
    } catch (error) {
        console.error('Error fetching popular novels:', error);
        return [];
    }
};

const searchNovels = async (novelName: string, pageNumber: number) => {
    try {
        const url = `${sourceURL}/search?keyword=${novelName}&page=${pageNumber}`;
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

        const novelList = $('.ul-list1 .li-row');
        const data = novelList.map((index: number, element: cheerio.Element) => {
            const title = $(element).find('h3.tit a').attr('title');
            const author = $(element).find().text().trim();
            const imageURL = `${sourceURL}${$(element).find('.pic a img').attr('src')}`;
            const chapterCount = $(element).find('a.chapter').attr('title');
            const novelPageURL = $(element).find('.pic a').attr('href');
            const sourceName = `${sourceURL}${novelPageURL}`;
            // console.log($(element).find('h3.tit a').attr("title"));
            return {
                title,
                author,
                chapterCount,
                imageURL,
                novelPageURL,
                sourceName
            }
        }).get();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error searching novels:', error);
        return [];
    }
};

const fetchSingleNovel = async (novelPageURL: string) => {
    try {
        const url = `${novelPageURL}`;
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

        const image = $('div.m-imgtext .pic img').attr('src');
        const imageURL = `${sourceURL}${image}`;
        const author = $('div.m-imgtext a.a1').first().text().trim();
        const genres = $('div.m-imgtext span[title="Genre"]').nextAll('a').map((index: number, element: cheerio.Element) => {
            $(element).text().trim();
        }).get();
        const novelStatus = $('div.m-imgtext span[title="Status"]').next('a').text().trim();

        const title = $('div.m-desc h1.tit').text().trim();
        
        const description = $('div.m-desc div.txt div.inner').nextAll('p').map((index: number, element: cheerio.Element) => {
            $(element).text().trim();
        }).get()

        return {
            title,
            imageURL,
            description,
            author,
            genres,
            novelPageURL,
            novelStatus,
        };
    } catch (error) {
        console.error('Error fetching single novel:', error);
        return null;
    }
};

const fetchChapters = async (novelPageURL: string, page: number) => {
    try {
        const url = `${novelPageURL}?page=${page}`;
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

        const chapters =  $('#list-chapter ul li').map((index: number, element: cheerio.Element) => ({
            id: index+1,
            title: $(element).text().trim(),
            chapterPageURL: `${sourceURL}${$(element).attr('href')}`,
        })).get();

        return chapters;
    } catch (error) {
        console.error('Error fetching chapters:', error);
        return [];
    }
};

const fetchChapterContent = async (chapterPageURL: string) => {
    try {
        const url = `${chapterPageURL}`;
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

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

        const chapterTitle = $('span.chapter-title span.chapter-text').text().trim();
        chapterContent.title = chapterTitle;

        $('#chapter-content p').each((index: number, element: cheerio.Element) => {
            chapterContent.content.push($(element).text().trim());
        });

        // Add next chapter
        const nextChapterElement = $('li.reader-next-item a');
        if (nextChapterElement.length && !nextChapterElement.hasClass('disabled')) {
            const nextChapter = nextChapterElement.attr('href');
            const nextChapterURL = `${sourceURL}${nextChapter}`;
            if (nextChapter) {
                chapterContent.closeChapters['nextChapter'] = nextChapterURL;
            }
        }

        // Add previous chapter
        const prevChapterElement = $('li.prev a');
        if (prevChapterElement.length && !prevChapterElement.hasClass('disabled')) {
            const prevChapter = prevChapterElement.attr('href');
            const prevChapterURL = `${sourceURL}${prevChapter}`;
            if (prevChapter) {
                chapterContent.closeChapters['prevChapter'] = prevChapterURL;
            }
        }

        return chapterContent;
    } catch (error) {
        console.error('Error fetching chapter content:', error);
        return { title: '', content: [], closeChapters: {} };
    }
};


export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent };