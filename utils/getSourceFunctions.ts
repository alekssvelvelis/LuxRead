
import { popularNovels as AllNovelFullPopular, searchNovels as AllNovelFullSearch, fetchSingleNovel as AllNovelFullFetchSingle, fetchChapters as AllNovelFullChapters, fetchChapterContent as AllNovelFullChapterContent } from '@/sources/AllNovelFull';
import { popularNovels as LightNovelPubPopular, searchNovels as LightnovelPubSearch, fetchSingleNovel as LightNovelPubFetchSingle, fetchChapters as LightNovelPubChapters, fetchChapterContent as LightNovelPubChapterContent } from '@/sources/LightNovelPub';

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
    default:
        throw new Error('Source not found');
  }
};

export default getSourceFunctions;
