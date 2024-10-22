
import { popularNovels as AllNovelFullPopular, searchNovels as AllNovelFullSearch, fetchSingleNovel as AllNovelFullFetchSingle, fetchChapters as AllNovelFullChapters, fetchChapterContent as AllNovelFullChapterContent } from '@/sources/allnovelfull';
import { popularNovels as LightNovelPubPopular, searchNovels as LightnovelPubSearch, fetchSingleNovel as LightNovelPubFetchSingle, fetchChapters as LightNovelPubChapters, fetchChapterContent as LightNovelPubChapterContent } from '@/sources/LightNovelPub';
import { popularNovels as NovelBinPopular, searchNovels as NovelBinSearch, fetchSingleNovel as NovelBinFetchSingle, fetchChapters as NovelBinChapters, fetchChapterContent as NovelBinChapterContent } from '@/sources/novelbin';


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
    case 'NovelBin':
        return {
            popularNovels: NovelBinPopular,
            searchNovels: NovelBinSearch,
            fetchSingleNovel: NovelBinFetchSingle,
            fetchChapters: NovelBinChapters,
            fetchChapterContent: NovelBinChapterContent,
        };
    default:
        throw new Error('Source not found');
  }
};

export default getSourceFunctions;
