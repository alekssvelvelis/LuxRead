import * as cheerio from 'cheerio';
import { fetchHtml } from '@/utils/axios';
const sourceName = 'AllNovelFull';
const sourceURL = `https://allnovelfull.net`;

const popularNovels = async (pageNumber: number) => {
    try {
        const url = `${sourceURL}/most-popular?page=${pageNumber}`;
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

        const novelList = $('.ul-list1 .li-row');
        const data = novelList.map((_index: number, element: cheerio.Element) => {
            const title = $(element).find('h3.tit a').attr('title');
            const author = $(element).find().text().trim();
            const imageURL = `${sourceURL}${$(element).find('.pic a img').attr('src')}`;
            const chapterCount = $(element).find('a.chapter').attr('title');
            const novelPageURL = `${sourceURL}${$(element).find('.pic a').attr('href')}`;
            const sourceName = `${sourceURL}${novelPageURL}`;

            return {
                title,
                author,
                chapterCount,
                imageURL,
                novelPageURL,
                sourceName
            }
        }).get();

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
        const data = novelList.map((_index: number, element: cheerio.Element) => {
            const title = $(element).find('h3.tit a').attr('title');
            const author = $(element).find().text().trim();
            const imageURL = `${sourceURL}${$(element).find('.pic a img').attr('src')}`;
            const chapterCount = $(element).find('a.chapter').attr('title');
            const novelPageURL = $(element).find('.pic a').attr('href');
            const sourceName = `${sourceURL}${novelPageURL}`;

            return {
                title,
                author,
                chapterCount,
                imageURL,
                novelPageURL,
                sourceName
            }
        }).get();

        return data;
    } catch (error) {
        console.error('Error searching novels:', error);
        return [];
    }
};

const fetchSingleNovel = async (novelPageURL: string) => {
    try {
        const result = await fetchHtml(novelPageURL);
        const $ = cheerio.load(result);

        const image = $('div.m-imgtxt img').attr('src');
        const imageURL = image ? new URL(image, sourceURL).toString() : '';
        const author = $('div.m-imgtxt .txt .item a.a1').first().text().trim();
        const genres = $('div.m-imgtxt span[title="Genre"]').next('div.right').find('a').map((_: number, element: cheerio.Element) => {
            return $(element).text().trim();
        }).get();
        const status = $('div.m-imgtxt span[title="Status"]').next('div.right').find('a').attr('title');
        const descriptionText: string[] = [];
        $('#novel-summary-inner p').each((_index: number, element: cheerio.Element) => {
            descriptionText.push($(element).text().trim());
        });
        const totalChapters = Number($('#truyen').data('total-chapters')) || 0;
        const title = $('h1.tit').text().trim();

        return {
            title, 
            imageURL, 
            descriptionText, 
            author, 
            genres, 
            sourceURL: novelPageURL,
            status,
            chapterCount: totalChapters,
            sourceName,
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
            id: (50*(page-1))+index+1, // chapter count per page * (page-1 for first page query cases)) +index+1 (iterates from index 0)
            title: $(element).text().trim(),
            chapterPageURL: `${sourceURL}${$(element).find('a').attr('href')}`,
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

        $('#chapter-content p').each((_: number, element: cheerio.Element) => {
            chapterContent.content.push($(element).text().trim());
        });

        // Add next chapter
        const nextChapterElement = $('li.reader-next-item a');
        if (nextChapterElement.length && !nextChapterElement.hasClass('is-disabled')) {
            const nextChapter = nextChapterElement.attr('href');
            const nextChapterURL = `${sourceURL}${nextChapter}`;
            if (nextChapter) {
                chapterContent.closeChapters['nextChapter'] = nextChapterURL;
            }
        }

        // Add previous chapter
        const prevChapterElement = $('li.prev a');
        if (prevChapterElement.length && !prevChapterElement.hasClass('is-disabled')) {
            const prevChapter = prevChapterElement.attr('href');
            const prevChapterURL = `${sourceURL}${prevChapter}`;
            if (prevChapter) {
                chapterContent.closeChapters['prevChapter'] = prevChapterURL;
            }
        }
        console.log(chapterContent);
        return chapterContent;
    } catch (error) {
        console.log(chapterPageURL);
        console.error('Error fetching chapter content:', error);
        return { title: '', content: [], closeChapters: {} };
    }
};


export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent };