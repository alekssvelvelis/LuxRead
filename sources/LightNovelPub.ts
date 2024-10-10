import cheerio from 'react-native-cheerio';
import axios from 'axios';
const sourceName = 'LightNovelPub';
const sourceURL = `https://www.lightnovelpub.com`;

const popularNovels = async (pageNumber: number) => {
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
            const promises = novelList.map(async (index: number, element: cheerio.Element) => {
                const title = loadedCheerio(element).find('.novel-title a').text().trim();
                const novelPageHREF = loadedCheerio(element).find('.novel-title a').attr('href');
                const novelPageURL = `${sourceURL}${novelPageHREF}`;
                const imageURL = loadedCheerio(element).find('.novel-item img').attr('data-src');
                if (title && novelPageURL) {
                    return {
                        title,
                        imageURL,
                        novelPageURL,
                        sourceName,
                    };
                }
            }).get();
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
    try {
        const verifyToken = await searchVerifyToken();
        const body = await searchNovelsAxios(novelName, verifyToken);
        const loadedCheerio = cheerio.load(body.data.resultview);
        const novelList = loadedCheerio('li.novel-item');
        const promises = novelList.map(async (index: number, element: cheerio.Element) => {
            const title = loadedCheerio(element).find('h4.novel-title').text().trim();
            const novelPageHREF = loadedCheerio(element).find('a').attr('href');
            const imageURL = loadedCheerio(element).find('img').attr('src');
            const chapterCount = loadedCheerio(element).find('div.novel-stats span').first().text().trim();
            const novelPageURL = `${sourceURL}${novelPageHREF}`;
            // console.log(title);
            // console.log(novelPageURL);
            // console.log(imageURL);
            // console.log(chapterCount);
            if(title && novelPageHREF && imageURL){
                return{
                    title,
                    imageURL,
                    chapterCount,
                    novelPageURL,
                };
            }
        }).get();
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
        // console.log(body);
        const loadedCheerio = cheerio.load(body);
        return loadedCheerio('.chapter-list li a').map((i: number, el: cheerio.Element) => ({
            title: loadedCheerio(el).text().trim(),
            url: `${sourceURL}${loadedCheerio(el).attr('href')}`,
        })).get();
    } catch (error) {
        console.error('Error fetching chapters for ', novelPageURL);
        return [];
    }
}

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
        
        const chapterTitle = loadedCheerio('.chapter-title').text().trim();
        chapterContent.title = chapterTitle;

        loadedCheerio('#chapter-container p').each((i: number, el: cheerio.Element) => {
            chapterContent.content.push(loadedCheerio(el).text().trim());
        });

        const nextChapterElement = loadedCheerio('nextchap');
        if (nextChapterElement.length && !nextChapterElement.hasClass('isDisabled')) {
            const nextChapter = nextChapterElement.attr('href');
            const nextChapterURL = `${sourceURL}${nextChapter}`;
            if (nextChapter) {
                chapterContent.closeChapters['nextChapter'] = nextChapterURL;
            }
        }

        const prevChapterElement = loadedCheerio('prevchap');
        if (prevChapterElement.length && !prevChapterElement.hasClass('isDisabled')) {
            const prevChapter = prevChapterElement.attr('href');
            const prevChapterURL = `${sourceURL}${prevChapter}`;
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