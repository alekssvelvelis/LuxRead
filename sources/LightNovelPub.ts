import cheerio from 'react-native-cheerio';
import pLimit from 'p-limit';
import axios from 'axios';
const sourceName = 'LightNovelPub';
const sourceURL = `https://www.lightnovelpub.com`;

interface ExtraTableData{
    author: string;
    chapterCount: string;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


const fetchRelevantOfNovel = async (novelPageURL: string) => {
    await sleep(1000);
    try {
        const result = await axios.get(novelPageURL, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            }
        });
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const author = loadedCheerio('.novel-info .author a span').text().trim();
        const chapterCount = loadedCheerio('.novel-info .header-stats strong').first().text().trim();
        return {
            author,
            chapterCount,
        };
    } catch (error) {
        console.error('Error fetching author of novel', error);
        return [];
    }
}

const popularNovels = async (pageNumber: number) => {
    const limit = pLimit(3); // runs 3 requests asynchronously, so 15 / 3 = 5 batches to run (3 at a time)
    // When considering the pLimit, average time to fetch novels is calculated with as said below:
    // Given 15 novels and considering a 1000ms or 1s sleep, pLimit will need to run 5 batches of renders to get the novels.
    // Since we sleep 1000 for each batch, we have a minimum of 5 seconds. Considering overhead, we can say it will take twice as long.
    // 15 Novels at 3 pLimit will give us 5 * 2 = 10 seconds (give or take) 
    // This is the only solution I've found for not triggering an axios 429 for too many request calls. 

    try {
        const url = `${sourceURL}/browse/genre-all-25060123/order-popular/status-all?page=${pageNumber}`;
        try {
            const response = await axios.get(url, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
              }
            });
            const loadedCheerio = cheerio.load(response.data);
            const novelList = loadedCheerio('.novel-list > .novel-item');
            
            const promises = novelList.map((index: number, element: cheerio.Element) => 
                limit(async () => { // Limit each request to avoid overwhelming the server
                    const title = loadedCheerio(element).find('.novel-title a').text().trim();
                    const novelPageHREF = loadedCheerio(element).find('.novel-title a').attr('href');
                    const novelPageURL = `${sourceURL}${novelPageHREF}`;
                    const imageURL = loadedCheerio(element).find('.novel-item img').attr('data-src');
                    const tableNecessaryData: ExtraTableData = await fetchRelevantOfNovel(novelPageURL);
                    const author = tableNecessaryData.author;
                    const chapterCount = tableNecessaryData.chapterCount;
    
                    if (title && novelPageURL && author && chapterCount) {
                        return {
                            title,
                            imageURL,
                            author,
                            chapterCount,
                            novelPageURL,
                            sourceName,
                        };
                    }
                })
            ).get();

            return Promise.all(promises).then(results => results.filter(Boolean)); // Filter out undefined values
        } catch (error) {
              console.error('axios error ', error)
        }  
    } catch (error) {
        console.error('Failure to fetch popular novels at', sourceName, 'with url', sourceURL, 'throws', error);
        return [];
    }
}

const searchNovelsAxios = async (novelName: string, LNRequestToken: string) => {
    try {
        const response = await axios.post(
            'https://www.lightnovelpub.com/lnsearchlive', 
            { 
                inputContent: novelName 
            },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
              'Lnrequestverifytoken': LNRequestToken,
            }
          }
        );
        return response;
      } catch (error) {
       console.error('Error fetching novels with API at', sourceURL, 'for', novelName);
       return [];
      }
};

const searchVerifyToken = async () => {
    try {
        const response = await axios.get('https://www.lightnovelpub.com/search', {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            }
          });
        const loadedCheerio = cheerio.load(response.data);
        const verifyToken = loadedCheerio('input[name="__LNRequestVerifyToken"]').attr('value');
        return verifyToken;
    } catch (error) {
        console.error('Error getting the verify token for lightnovelpub', error);
        return [];
    }
}

const searchNovels = async (novelName: string) => {
    const limit = pLimit(3);
    // look at popularNovels for explanation on plimit usage for lightnovelpub
    try {
        const verifyToken = await searchVerifyToken();
        const body = await searchNovelsAxios(novelName, verifyToken);
        const loadedCheerio = cheerio.load(body.data.resultview);
        const novelList = loadedCheerio('li.novel-item');
        // const promises = novelList.map((index: number, element: cheerio.Element) => limit(async () => { })
        const promises = novelList.map((index: number, element: cheerio.Element) => 
            limit(async () => { 
                const title = loadedCheerio(element).find('h4.novel-title').text().trim();
                const novelPageHREF = loadedCheerio(element).find('a').attr('href');
                const imageURL = loadedCheerio(element).find('img').attr('src');
                const novelPageURL = `${sourceURL}${novelPageHREF}`;
                if(title && novelPageHREF && imageURL){
                    const tableNecessaryData: ExtraTableData = await fetchRelevantOfNovel(novelPageURL);
                    const author = tableNecessaryData.author;
                    const chapterCount = tableNecessaryData.chapterCount;
                    return{
                        title,
                        imageURL,
                        author,
                        chapterCount,
                        novelPageURL,
                        sourceName,
                    };
                }
            })).get();
        return Promise.all(promises);
    } catch (error) {
        console.error('Failure to fetch search novels at', sourceName, 'with url', sourceURL, 'throws', error);
        return [];
    }
}

const fetchSingleNovel = async (novelPageURL: string) => {
    try {
        const result = await axios.get(novelPageURL, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            }
        });
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const imageURL = loadedCheerio('.fixed-img img').attr('data-src');
        const description = loadedCheerio('.summary p').text().trim();
        const title = loadedCheerio('.novel-info .novel-title').text().trim();
        const author = loadedCheerio('.novel-info .author a span').text().trim();
        const chapterCount = loadedCheerio('.header-stats strong').text().match(/\d+/) || '0';
        const genres = loadedCheerio('.categories li').find('a').map((i: number, el: cheerio.Element) => loadedCheerio(el).text()).toArray().join(',');
        return {
            title,
            imageURL,
            description,
            author,
            genres,
            url: novelPageURL,
            chapterCount,
        };
    } catch (error) {
        console.error('Failure to fetch single novel at', sourceName, 'with url', sourceURL, 'throws', error);
        return [];
    }
}

const fetchChapters = async (novelPageURL: string, page: number) => {
    try {
        const url = `${novelPageURL}/chapters?page=${page}`;
        const result = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            }
        });
        const body = result.data;
        const loadedCheerio = cheerio.load(body);
        const chapters: { title: string, url: string }[] = [];

        loadedCheerio('.chapter-list li a').each((i: number, el: cheerio.Element) => {
            const title = loadedCheerio(el).attr('title') || '';
            const chapterUrl = `${sourceURL}${loadedCheerio(el).attr('href')}`;

            chapters.push({ title, url: chapterUrl });
        });
        return chapters;
    } catch (error) {
        console.error('Error fetching chapters for ', novelPageURL);
        return [];
    }
}

const fetchChapterContent = async (chapterPageURL: string) => {
    try { 
        const url = `${chapterPageURL}`;
        const result = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36',
            }
        });
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
        
        const chapterTitle = loadedCheerio('.chapter-title').text().trim();
        chapterContent.title = chapterTitle;

        loadedCheerio('#chapter-container p').each((i: number, el: cheerio.Element) => {
            chapterContent.content.push(loadedCheerio(el).text().trim());
        });

        const nextChapterElement = loadedCheerio('.nextchap');
        console.log('nextb4');
        if (nextChapterElement && !nextChapterElement.hasClass('isDisabled')) {
            console.log(1);
            const nextChapter = nextChapterElement.attr('href');
            const nextChapterURL = `${sourceURL}${nextChapter}`;
            console.log(nextChapterURL);
            if (nextChapter) {
                chapterContent.closeChapters['nextChapter'] = nextChapterURL;
            }
        }

        const prevChapterElement = loadedCheerio('.prevchap');
        console.log('prevb4');
        if (prevChapterElement && !prevChapterElement.hasClass('isDisabled')) {
            console.log(2);
            const prevChapter = prevChapterElement.attr('href');
            const prevChapterURL = `${sourceURL}${prevChapter}`;
            console.log(prevChapterURL);
            if (prevChapter) {
                chapterContent.closeChapters['prevChapter'] = prevChapterURL;
            }
        }

        return chapterContent;
    } catch (error) {
        console.error('Error fetching chapters contents at ', chapterPageURL);
        return [];
    }
}

export { popularNovels, searchNovels, fetchSingleNovel, fetchChapters, fetchChapterContent };