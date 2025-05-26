
import { popularNovels as AllNovelFullPopular, searchNovels as AllNovelFullSearch, fetchSingleNovel as AllNovelFullFetchSingle, fetchChapters as AllNovelFullChapters, fetchChapterContent as AllNovelFullChapterContent } from '@/sources/AllNovelFull';
import { popularNovels as LightNovelPubPopular, searchNovels as LightnovelPubSearch, fetchSingleNovel as LightNovelPubFetchSingle, fetchChapters as LightNovelPubChapters, fetchChapterContent as LightNovelPubChapterContent } from '@/sources/LightNovelPub';
import { popularNovels as NovelBinPopular, searchNovels as NovelBinSearch, fetchSingleNovel as NovelBinFetchSingle, fetchChapters as NovelBinChapters, fetchChapterContent as NovelBinChapterContent } from '@/sources/NovelBin';
import { popularNovels as ReadNovelFullPopular, searchNovels as ReadNovelFullSearch, fetchSingleNovel as ReadNovelFullFetchSingle, fetchChapters as ReadNovelFullChapters, fetchChapterContent as ReadNovelFullChapterContent } from '@/sources/ReadNovelFull';

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
    case 'ReadNovelFull':
        return {
            popularNovels: ReadNovelFullPopular,
            searchNovels: ReadNovelFullSearch,
            fetchSingleNovel: ReadNovelFullFetchSingle,
            fetchChapters: ReadNovelFullChapters,
            fetchChapterContent: ReadNovelFullChapterContent,
        };
    default:
        throw new Error('Source not found');
  }
};

export default getSourceFunctions;
