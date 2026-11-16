import * as cheerio from 'cheerio';
import { fetchHtml, htmlToText } from '@/utils/axios';
const sourceName = 'ReadNovelFull';
const sourceURL = `https://readnovelfull.com`;


const popularNovels = async (pageNumber: number) => {
    try {
        const url = `${sourceURL}/novel-list/hot-novel?page=${pageNumber}`;
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

        const novelList = $('.list-novel .row');
        const data = novelList.map((_index: number, element: cheerio.Element) => {
            const title = $(element).find('h3.novel-title a').attr('title');
            const author = $(element).find('span.author span').text().trim();
            const chapterCountText = $(element).find('.text-info .chr-text').text();
            const chapterCount = parseInt(chapterCountText.match(/\d+/)?.[0] || '0', 10);
            const novelPageURL = `${sourceURL}${$(element).find('.novel-title a').attr('href')}`;
            const imageURL = $(element).find('img.cover').attr('src');

            if(imageURL != undefined){
                return {
                    title,
                    author,
                    chapterCount,
                    imageURL,
                    novelPageURL,
                    sourceName
                };
            }
        }).get();

        return data;
    } catch (error) {
        console.error('Error fetching popular novels:', error);
        throw error;
    }
};

const searchNovels = async (novelName: string, pageNumber: number) => {
    try {
        const url = `${sourceURL}/novel-list/search?keyword=${novelName}&page=${pageNumber}`;
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);
        
        const novelList = $('.list-novel .row');
        const data = novelList.map((_index: number, element: cheerio.Element) => {
            const title = $(element).find('h3.novel-title a').attr('title');
            const author = $(element).find('span.author span').text().trim();
            const chapterCountText = $(element).find('.text-info .chr-text').text();
            const chapterCount = parseInt(chapterCountText.match(/\d+/)?.[0] || '0', 10);
            const novelPageURL = `${sourceURL}${$(element).find('.novel-title a').attr('href')}`;
            const imageURL = $(element).find('img.cover').attr('src');
            
            if(imageURL != undefined){
                return {
                    title,
                    author,
                    chapterCount,
                    imageURL,
                    novelPageURL,
                    sourceName
                };
            }
        }).get();

        return data;
    } catch (error) {
        console.error('Error fetching searched novels:', error);
        throw error;
    }
};

const fetchSingleNovel = async (novelPageURL: string) => {
    try {
        const url = novelPageURL;
        const result = await fetchHtml(url);
        const $ = cheerio.load(result);

        const title = $('h3.title').first().text().trim();
        const author = $('meta[itemprop="name"]').attr('content');
        const imageURL = $('div.book img').first().attr('src');
        const genres = $('ul.info-meta li:has(h3:contains("Genre:")) a').map((_index: number, element: cheerio.Element) => {
            return $(element).text().trim();
        }).get();

        const sourceNovelId = Number($('#rating').attr('data-novel-id'));
        if (!Number.isSafeInteger(sourceNovelId) || sourceNovelId <= 0) {
            throw new Error(`Novel ID not found on ${novelPageURL}`);
        }

        const novelStatus = $('ul.info-meta li:has(h3:contains("Status:"))').find('a').text().trim();
        const paragrahps: string | string[] = [];
        $('div.desc-text p').each((_index: number, element: cheerio.Element) => {
            const html = $(element).html();
            if (!html) return;
            const text = htmlToText(html);
            paragrahps.push(text);
        });
        const description: string = paragrahps.join("\n\n");
        const chapterCountstring = $('div.item-value a').text().trim();
        const match = chapterCountstring.match(/Chapter\s+(\d+)/i);
        const chapterCount = match ? parseInt(match[1], 10) : null;

        return {
            title, 
            imageURL, 
            descriptionText: description, 
            author, 
            genres, 
            novelPageURL,
            novelStatus,
            chapterCount,
            sourceNovelId,
            novelSource: sourceName,
        };

    } catch (error) {
        console.error(`Error fetching single novel: ${sourceURL}`, error);
        return null;
    }
};


const fetchChapters = async (novelPageURL: string, pageNumber: number, sourceNovelId?: number) => {
    try {
        if (!Number.isSafeInteger(sourceNovelId) || !sourceNovelId || sourceNovelId <= 0) {
            throw new Error(`A valid ReadNovelFull novel ID is required for ${novelPageURL}`);
        }
        console.log(pageNumber, 'inside of /sources/ReadNovelFull:fetchChapters');
        const actualPageNumber = pageNumber-1; // .eq() uses 0-based index
        const APIurl = `${sourceURL}/ajax/chapter-archive?novelId=${sourceNovelId}`;
        const result = await fetchHtml(APIurl);
        const $ = cheerio.load(result);
        const rowToGet = $('.panel-body .row').eq(actualPageNumber);
        const titlesAndHrefs = rowToGet.find('ul li a').map((index: number, element: cheerio.Element) => {
            return {
                id: index+1,
                title: $(element).text().trim(),
                chapterPageURL: `${sourceURL}${$(element).attr('href')}`,
            };
        }).get();
        return titlesAndHrefs;
    } catch (error) {
        console.error('Error fetching ReadNovelFull chapters:', error);
        throw error;
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

        const chapterTitle = $('a.chr-title').attr('title');
        chapterContent.title = chapterTitle ? chapterTitle : $('a.chr-title span.chr-text').text().trim();

        $('#chr-content p').each((_: number, element: cheerio.Element) => {
            chapterContent.content.push($(element).text().trim());
        });

        // Add next chapter
        const nextChapterElement = $('#next_chap');
        if (nextChapterElement.length && !nextChapterElement.attr('disabled')) {
            const nextChapter = nextChapterElement.attr('href');
            const nextChapterURL = `${sourceURL}${nextChapter}`;
            if (nextChapter) {
                chapterContent.closeChapters['nextChapter'] = nextChapterURL;
            }
        }

        // Add previous chapter
        const prevChapterElement = $('#prev_chap');
        if (prevChapterElement.length && !prevChapterElement.attr('disabled')) {
            const prevChapter = prevChapterElement.attr('href');
            const prevChapterURL = `${sourceURL}${prevChapter}`;
            if (prevChapter) {
                chapterContent.closeChapters['prevChapter'] = prevChapterURL;
            }
        }
        // console.log(chapterContent);
        return chapterContent;
    } catch (error) {
        console.error('Error fetching chapter content:', error);
        return { title: '', content: [], closeChapters: {} };
    }
};

export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent};
// export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent };
