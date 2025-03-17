import * as SQLite from 'expo-sqlite';

async function openDatabase() {
    return await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
}

async function getTableStructure(tableName: string) {
    const db = await openDatabase();
    try {
        const tableInfo = await db.getAllAsync(`PRAGMA table_info(${tableName});`);
        console.log(`Structure of table "${tableName}":`, tableInfo);
        return tableInfo;
    } catch (error) {
        console.error(`Failed to get structure of table "${tableName}":`, error);
        return;
    }
}

async function setupSourcesTable(){
    const db = await openDatabase();
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS sources 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sourceName TEXT NOT NULL,
                baseImage TEXT NOT NULL,
                UNIQUE(sourceName)
            );
        `);
        console.log('Created Sources table');
        await db.execAsync(`
            INSERT INTO sources (sourceName, baseImage) VALUES 
            ('AllNovelFull', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyjJn_YwCifVmvArmnCMIVroxl61obyCE5WQ&s'),
            ('LightNovelPub', 'https://i.redd.it/ui97q7ehwqsa1.jpg'),
            ('NovelBin', 'https://novelbin.com/img/logo.png')
        `);
        console.log('Successfully inserted default sources');
    } catch (error) {
       console.error('Error creating Sources table ', error);
    }
}

interface SourcesRows{
    id: number;
    sourceName: string;
    baseImage: string;
}

async function getSources() {
    const db = await openDatabase();

    try {
        const allRows: SourcesRows[] = await db.getAllAsync(
            `SELECT * FROM sources ORDER BY sourceName ASC`,
        );

        const downloadedChapters = [];

        for (const row of allRows) {
            downloadedChapters.push({
                id: row.id,
                sourceName: row.sourceName,
                baseImage: row.baseImage,
            });
        }

        if (allRows.length === 0) {
            console.log('No sources found');
        }

        return downloadedChapters;
    } catch (error) {
        console.error('Error fetching sources');
        return [];
    }
}

async function setupLibraryNovelsTable(){
    const db = await openDatabase();
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS libraryNovels 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                description TEXT NOT NULL,
                genres TEXT NOT NULL,
                chapterCount INTEGER NOT NULL,
                imageURL TEXT NOT NULL,
                novelPageURL TEXT NOT NULL,
                novelSource TEXT NOT NULL,
                novelStatus TEXT NOT NULL,
                UNIQUE(title, author, novelPageURL),
                FOREIGN KEY (novelSource) REFERENCES sources(sourceName) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
        console.log('Created librarynovels table');
    } catch (error) {
       console.error('Error creating LibraryNovels table ', error) 
    }
}

async function insertLibraryNovel(title: string, author: string, description: string, genres: string, chapterCount: number, imageURL: string, novelPageURL: string, novelSource: string, novelStatus: string) {
    const db = await openDatabase();
    try {
        console.log(novelPageURL);
        const result = await db.runAsync(
          `INSERT INTO libraryNovels (title, author, description, genres, chapterCount, imageURL, novelPageURL, novelSource, novelStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [title, author, description, genres, chapterCount, imageURL, novelPageURL, novelSource, novelStatus]
        );
        console.log(`Novel ${title}, written by ${author} succesfully added. Extra data: ${imageURL} and ${novelPageURL} and ${result.lastInsertRowId}`);
        return result.lastInsertRowId;
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.error('Error: Novel with the same title, author, novelPageURL already exists.');
            return;
        } else {
            console.error('Insert for TABLE libraryNovels failed due to:', error);
            return;
        }
    }
}

async function setupNovelChaptersTable(){
    const db = await openDatabase();
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS novelChapters 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                novel_id INTEGER NOT NULL,
                readerProgress FLOAT NOT NULL,
                chapterIndex INTEGER NOT NULL,
                UNIQUE(novel_id),
                FOREIGN KEY(novel_id) REFERENCES libraryNovels(id)
            );
        `);
        console.log('Created novelChapters table');
    } catch (error) {
       console.error('Error creating novelChapters table ', error) 
    }
}

async function upsertNovelChapter(novelTitle: string, readerProgress: number, chapterIndex: number) {
    const db = await openDatabase();
    try {
        const novelRow: NovelRow[] = await db.getAllAsync(
            `SELECT id FROM libraryNovels WHERE title = ?`,
            [novelTitle]
        );
        if (!novelRow) {
            console.log(`No novel saved with the title: ${novelTitle}`);
            return;
        }
        const novelToUpdateId = novelRow[0].id;
        await db.runAsync(
            `INSERT INTO novelChapters (novel_id, readerProgress, chapterIndex) VALUES (?, ?, ?)
            ON CONFLICT(novel_id) 
            DO UPDATE SET 
                readerProgress = CASE 
                    WHEN excluded.chapterIndex > novelChapters.chapterIndex 
                         OR (excluded.chapterIndex = novelChapters.chapterIndex AND excluded.readerProgress > novelChapters.readerProgress) 
                    THEN excluded.readerProgress 
                    ELSE novelChapters.readerProgress 
                END,
                chapterIndex = CASE 
                    WHEN excluded.chapterIndex > novelChapters.chapterIndex 
                    THEN excluded.chapterIndex 
                    ELSE novelChapters.chapterIndex 
                END;`,
            [novelToUpdateId, readerProgress, chapterIndex]
        );
        console.log('Upserted novel chapter');
    } catch (error) {
        console.error('Error upserting novel chapter: ', error);
    }
}

async function setupDownloadedChaptersTable(){
    const db = await openDatabase();
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS downloadedChapters 
            (
                downloadId INTEGER PRIMARY KEY AUTOINCREMENT,
                chapterTitle TEXT NOT NULL,
                chapterText TEXT NOT NULL,
                chapterPageURL TEXT NOT NULL,
                novel_id INTEGER NOT NULL,
                FOREIGN KEY (novel_id) REFERENCES libraryNovels(id) ON DELETE CASCADE ON UPDATE CASCADE
                UNIQUE (chapterTitle, novel_id)
            );
        `);
        console.log('Created downloadedChapters table');
    } catch (error) {
       console.error('Error creating downloadedChapters table ', error) 
    }
}

async function insertDownloadedChapter(chapterTitle: string, chapterText: string, chapterPageURL: string, novel_id: number) {
    const db = await openDatabase();
    try {
        const serializedChapterText = JSON.stringify(chapterText);
        const result = await db.runAsync(
          `INSERT INTO downloadedChapters (chapterTitle, chapterText, chapterPageURL, novel_id) VALUES (?, ?, ?, ?)`,
          [chapterTitle, serializedChapterText, chapterPageURL, novel_id]
        );
        if(result){
            // console.log(serializedChapterText);
        }
    } catch (error) {
        console.error('Insert for TABLE libraryNovels failed due to:', error);
    }
}

interface DownloadedChapterRow{
    id: number;
    downloadId: number;
    chapterTitle: string;
    chapterText: string | string[];
    chapterPageURL: string;
    novel_id: number;
}

async function getDownloadedChapters(novelId: number) {
    const db = await openDatabase();

    try {
        const allRows: DownloadedChapterRow[] = await db.getAllAsync(
            `SELECT * FROM downloadedChapters WHERE novel_id = ? ORDER BY CAST(SUBSTR(chapterTitle, INSTR(chapterTitle, ' ') + 1) AS INTEGER) ASC`,
            [novelId]
        );

        const downloadedChapters = [];

        for (const row of allRows) {
            downloadedChapters.push({
                id: row.downloadId,
                title: row.chapterTitle,
                content: row.chapterText,
                chapterPageURL: row.chapterPageURL,
                novel_id: row.novel_id,
            });
        }

        if (allRows.length === 0) {
            console.log('No chapters found downloaded for this novel', novelId);
        }

        return downloadedChapters;
    } catch (error) {
        console.error('Error fetching downloaded novel chapters:', error, ' for ', novelId);
        return [];
    }
}
interface DownloadedChapterContent {
    title: string;
    content: string[] | string;
    closeChapters: { [chapterTitle: string]: string | undefined};
}

async function getDownloadedChapterContent(chapterPageURL: string): Promise<DownloadedChapterContent | null> {
    const db = await openDatabase();

    try {
        const currentChapterResult = await db.getAllAsync(
            `SELECT chapterTitle, chapterText, novel_id FROM downloadedChapters WHERE chapterPageURL = ?`,
            [chapterPageURL]
        );

        if (!currentChapterResult || currentChapterResult.length === 0) {
            console.log('No chapter found with the provided URL');
            return null;
        }
        
        const currentChapter = currentChapterResult[0] as DownloadedChapterRow;
        // console.log(currentChapter.chapterText);
        const novelId = currentChapter.novel_id;

        // Fetch all chapter titles and URLs for the novel
        const allChaptersResult: DownloadedChapterRow[] = await db.getAllAsync(
            `SELECT chapterTitle, chapterPageURL FROM downloadedChapters WHERE novel_id = ?`,
            [novelId]
        );

        if (!allChaptersResult || allChaptersResult.length === 0) {
            console.log('No chapters found for this novel');
            return null;
        }

        const extractChapterNumber = (title: string): number => {
            const match = title.match(/Chapter\s+(\d+)/);
            return match ? parseInt(match[1], 10) : -1;
        };
        const currentChapterNumber = extractChapterNumber(currentChapter.chapterTitle);

        const nextChapter = allChaptersResult.find(chapters => extractChapterNumber(chapters.chapterTitle) === currentChapterNumber+1);
        const prevChapter = allChaptersResult.find(chapters => extractChapterNumber(chapters.chapterTitle) === currentChapterNumber-1);

        const downloadedChapterContent: DownloadedChapterContent = {
            title: currentChapter.chapterTitle,
            content: currentChapter.chapterText,
            closeChapters: {
                prevChapter: prevChapter?.chapterPageURL,
                nextChapter: nextChapter?.chapterPageURL,
            }
        };

        return downloadedChapterContent;
    } catch (error) {
        console.error('Error fetching downloaded chapter content:', error);
        return null;
    }
}


interface ChapterRow{
    id: number;
    novel_id: number;
    readerProgress: number;
    chapterIndex: number;
}

async function getAllNovelChapters(novelTitle: string) {
    const db = await openDatabase();

    try {
        const novelRow: NovelRow[] = await db.getAllAsync(
            `SELECT id FROM libraryNovels WHERE title = ?`,
            [novelTitle]
        );

        if (!novelRow || novelRow.length === 0) {
            console.log(`No novel found with the title: ${novelTitle}`);
            return;
        }

        const novelId = novelRow[0].id;

        const allRows: ChapterRow[] = await db.getAllAsync(
            `SELECT * FROM novelChapters WHERE novel_id = ?`,
            [novelId]
        );

        const librarySavedNovels = [];

        for (const row of allRows) {
            librarySavedNovels.push({
                id: row.id,
                novelId: row.novel_id,
                readerProgress: row.readerProgress,
                chapterIndex: row.chapterIndex,
            });
        }

        if (allRows.length === 0) {
            console.log('No chapters found for this novel');
        }

        return librarySavedNovels;
    } catch (error) {
        console.error('Error fetching library novel chapters:', error);
        return [];
    }
}

interface NovelRow {
    id: number;
    title: string;
    author: string;
    description: string;
    genres: string | string[];
    chapterCount: number;
    imageURL: string;
    novelPageURL: string;
    novelSource: string;
}

async function getAllLibraryNovels(tableName: string) {
    const db = await openDatabase();
    try {
        const allRows: NovelRow[] = await db.getAllAsync(`SELECT * FROM ${tableName}`);
        const librarySavedNovels = []
        for (const row of allRows) {
            librarySavedNovels.push({
                id: row.id,
                title: row.title,
                author: row.author,
                description: row.description,
                genres: row.genres,
                chapterCount: row.chapterCount,
                imageURL: row.imageURL,
                novelPageURL: row.novelPageURL,
                novelSource: row.novelSource,
            });
        }

        if (allRows.length === 0) {
            console.log('no data to output getAllLibraryNovels');
        }

        return librarySavedNovels;
    } catch (error) {
        console.error('Error fetching library novels:', error);
        return [];
    }
}

async function getNovelsBySource(novelSource: string) {
    const db = await openDatabase();
    try {
        const allRows: NovelRow[] = await db.getAllAsync(
            `SELECT id, title FROM libraryNovels WHERE novelSource = ?`,
            [novelSource]
        );

        const librarySavedNovels = allRows.map(row => ({
            id: row.id,
            title: row.title,
        }));

        if (librarySavedNovels.length === 0) {
            console.log('no data to output getNovelsBySource');
        }
        
        return librarySavedNovels;
    } catch (error) {
        console.error('Error fetching library novels:', error);
        return [];
    }
}


async function deleteLibraryNovel(novelId: number) {
    const db = await openDatabase();
    try {
        await db.execAsync(`DELETE FROM libraryNovels WHERE id = ${novelId}`);
        console.log(`Table "libraryNovels" ${novelId} cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear ${novelId} from table "libraryNovels": `, error);
    }
}
async function deleteNovelChapters(novelId: number) {
    const db = await openDatabase();
    try {
        await db.execAsync(`DELETE FROM novelChapters WHERE novel_id = ${novelId}`);
        console.log(`Table "novelChapters" ${novelId} cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear ${novelId} from table "novelChapters": `, error);
    }
}

async function clearTable(tableName: string) {
    const db = await openDatabase();
    try {
        await db.execAsync(`DELETE FROM ${tableName}`);
        console.log(`Table "${tableName}" cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear table "${tableName}":`, error);
    }
}

async function dropTable(tableName: string) {
    const db = await openDatabase();
    try {
        await db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`Table "${tableName}" dropped successfully.`);
    } catch (error) {
        console.error(`Failed to drop table "${tableName}":`, error);
    }
}
export { clearTable, getAllNovelChapters, setupSourcesTable, getSources, setupLibraryNovelsTable, insertLibraryNovel, getAllLibraryNovels, dropTable, deleteLibraryNovel, deleteNovelChapters, getTableStructure, getNovelsBySource, setupNovelChaptersTable, upsertNovelChapter, setupDownloadedChaptersTable, getDownloadedChapters, insertDownloadedChapter, getDownloadedChapterContent };
