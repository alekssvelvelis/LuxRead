interface RelevantNovelData {
  id: string,
  title: string;
  author: string;
  description: string;
  genres: string | string[];
  chapterCount: number;
  imageURL: string;
  novelPageURL: string;
  novelSource: string;
  novelStatus: string;
};

interface readingProgress {
  id: number;
  novel_id: string;
  readerProgress: number;
  chapterIndex: number;
};

import { router } from "expo-router";

export const handleNavigateToNovel = async (novelId: string, novelSource: string, novelPageURL: string, errorPhrase: string, novelIsSaved: boolean = false) => {
    try {
      router.navigate({
        pathname: "/novel/[id]",
        params: {
            id: novelId,
            novelSource: novelSource,
            novelPageURL: novelPageURL,
            novelIsSaved: String(novelIsSaved),
        },
      });
    } catch (error) {
      console.error(errorPhrase, error);
    }
}

export const handleNavigateToChapter = async (novelData: RelevantNovelData, chapterPageURL: string, itemId: number, readingProgress: readingProgress) => {
    try {
      router.navigate({
        pathname: "/chapter/[id]", 
        params: {
          id: `${novelData?.title}-${novelData?.novelSource}`,
          chapterPageURL: chapterPageURL,
          title: novelData?.title,
          novelSource: novelData.novelSource,
          ...(readingProgress.chapterIndex === itemId && { readerProgress: readingProgress.readerProgress}),
        },
      });
    } catch (error) {
      console.error("Error fetching single novel:", error);
    }
  };