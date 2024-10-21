
import { popularNovels as AllNovelFullPopular, searchNovels as AllNovelFullSearch, fetchSingleNovel as AllNovelFullFetchSingle, fetchChapters as AllNovelFullChapters, fetchChapterContent as AllNovelFullChapterContent } from '@/sources/allnovelfull';
import { popularNovels as LightNovelPubPopular, searchNovels as LightnovelPubSearch, fetchSingleNovel as LightNovelPubFetchSingle, fetchChapters as LightNovelPubChapters, fetchChapterContent as LightNovelPubChapterContent } from '@/sources/LightNovelPub';
import { popularNovels as AllNovelBlogPopular, searchNovels as AllNovelBlogSearch, fetchSingleNovel as AllNovelBlogFetchSingle, fetchChapters as AllNovelBlogChapters, fetchChapterContent as AllNovelBlogChapterContent } from '@/sources/allnovelblog';


const getSourceFunctions = (sourceName: string) => {
  switch (sourceName) {
    case 'AllNovelFull':
        return {
            popularNovels: AllNovelFullPopular,
            searchNovels: AllNovelFullSearch,
            fetchSingleNovel: AllNovelFullFetchSingle,
            fetchChapters: AllNovelFullChapters,
            fetchChapterContent: AllNovelFullChapterContent
        };
    case 'LightNovelPub':
        return {
            popularNovels: LightNovelPubPopular,
            searchNovels: LightnovelPubSearch,
            fetchSingleNovel: LightNovelPubFetchSingle,
            fetchChapters: LightNovelPubChapters,
            fetchChapterContent: LightNovelPubChapterContent
        };
    case 'AllNovelBlog':
        return {
            popularNovels: AllNovelBlogPopular,
            searchNovels: AllNovelBlogSearch,
            fetchSingleNovel: AllNovelBlogFetchSingle,
            fetchChapters: AllNovelBlogChapters,
            fetchChapterContent: AllNovelBlogChapterContent,
        };
    default:
        throw new Error('Source not found');
  }
};

export default getSourceFunctions;
