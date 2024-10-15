import * as SQLite from 'expo-sqlite';

async function getTableStructure(tableName: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
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
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS sources 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                sourceName TEXT NOT NULL,
                UNIQUE(sourceName)
            );
        `);
        console.log('Created Sources table');
        await db.execAsync(`
            INSERT INTO sources (sourceName) VALUES 
            ('AllNovelFull'),
            ('LightNovelPub');
        `);
        console.log('Succesfully inserted default sources');
    } catch (error) {
       console.error('Error creating Sources table ', error) 
    }
}

async function setupLibraryNovelsTable(){
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS libraryNovels 
            (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                chapterCount INTEGER NOT NULL,
                imageURL TEXT NOT NULL,
                novelPageURL TEXT NOT NULL,
                novelSource TEXT NOT NULL,
                UNIQUE(title, author, novelPageURL),
                FOREIGN KEY (novelSource) REFERENCES sources(sourceName) ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);
        console.log('Created librarynovels table');
    } catch (error) {
       console.error('Error creating LibraryNovels table ', error) 
    }
}

async function insertLibraryNovel(title: string, author: string, chapterCount: number, imageURL: string, novelPageURL: string, novelSource: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
    try {
        const result = await db.runAsync(
          `INSERT INTO libraryNovels (title, author, chapterCount, imageURL, novelPageURL, novelSource) VALUES (?, ?, ?, ?, ?, ?)`,
          [title, author, chapterCount, imageURL, novelPageURL, novelSource]
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
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
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
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
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
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
    try {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS downloadedChapters 
            (
                downloadId INTEGER PRIMARY KEY AUTOINCREMENT,
                chapterTitle TEXT NOT NULL,
                chapterText TEXT NOT NULL,
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

async function insertDownloadedChapter(chapterTitle: string, chapterText: string, novel_id: number) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
    try {
        const result = await db.runAsync(
          `INSERT INTO downloadedChapters (chapterTitle, chapterText, novel_id) VALUES (?, ?, ?)`,
          [chapterTitle, chapterText, novel_id]
        );
        if(result){
            console.log(`Chapter ${chapterTitle}, for novel with id ${novel_id} succesfully added`);
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
    novel_id: number;
}

async function getDownloadedChapters(novelId: number) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });

    try {
        const allRows: DownloadedChapterRow[] = await db.getAllAsync(
            `SELECT * FROM novelChapters WHERE novel_id = ?`,
            [novelId]
        );

        const downloadedChapters = [];

        for (const row of allRows) {
            downloadedChapters.push({
                id: row.id,
                chapterTitle: row.chapterTitle,
                chapterContent: row.chapterText,
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

interface ChapterRow{
    id: number;
    novel_id: number;
    readerProgress: number;
    chapterIndex: number;
}


async function getAllNovelChapters(novelTitle: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });

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
    id: number | string;
    title: string;
    author: string;
    chapterCount: number;
    imageURL: string;
    novelPageURL: string;
    novelSource: string;
}

async function getAllLibraryNovels(tableName: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
    try {
        const allRows: NovelRow[] = await db.getAllAsync(`SELECT * FROM ${tableName}`);
        const librarySavedNovels = []
        for (const row of allRows) {
            librarySavedNovels.push({
                id: row.id,
                title: row.title,
                author: row.author,
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
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
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
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
    try {
        await db.execAsync(`DELETE FROM libraryNovels WHERE id = ${novelId}`);
        console.log(`Table "libraryNovels" ${novelId} cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear ${novelId} from table "libraryNovels": `, error);
    }
}
async function deleteNovelChapters(novelId: number) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
    try {
        await db.execAsync(`DELETE FROM novelChapters WHERE novel_id = ${novelId}`);
        console.log(`Table "novelChapters" ${novelId} cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear ${novelId} from table "novelChapters": `, error);
    }
}

async function clearTable(tableName: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
    try {
        await db.execAsync(`DELETE FROM ${tableName}`);
        console.log(`Table "${tableName}" cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear table "${tableName}":`, error);
    }
}

async function dropTable(tableName: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
    try {
        await db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`Table "${tableName}" dropped successfully.`);
    } catch (error) {
        console.error(`Failed to drop table "${tableName}":`, error);
    }
}

export { clearTable, getAllNovelChapters, setupSourcesTable, setupLibraryNovelsTable, insertLibraryNovel, getAllLibraryNovels, dropTable, deleteLibraryNovel, deleteNovelChapters, getTableStructure, getNovelsBySource, setupNovelChaptersTable, upsertNovelChapter, setupDownloadedChaptersTable, getDownloadedChapters, insertDownloadedChapter };
