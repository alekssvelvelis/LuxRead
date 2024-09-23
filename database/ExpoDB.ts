import * as SQLite from 'expo-sqlite';

async function getTableStructure(tableName: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
    try {
        const tableInfo = await db.getAllAsync(`PRAGMA table_info(${tableName});`);
        console.log(`Structure of table "${tableName}":`, tableInfo);
        return tableInfo;
    } catch (error) {
        console.error(`Failed to get structure of table "${tableName}":`, error);
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
                UNIQUE(title, author, novelPageURL)
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
        await db.runAsync(
          `INSERT INTO libraryNovels (title, author, chapterCount, imageURL, novelPageURL, novelSource) VALUES (?, ?, ?, ?, ?, ?)`,
          [title, author, chapterCount, imageURL, novelPageURL, novelSource]
        );
        console.log(`Novel ${title}, written by ${author} succesfully added. Extra data: ${imageURL} and ${novelPageURL} and ${novelSource}`);
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.error('Error: Novel with the same title, author, novelPageURL already exists.');
        } else {
            console.error('Insert for TABLE libraryNovels failed due to:', error);
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

async function upsertNovelChapter(novel_id: number, readerProgress: number, chapterIndex: number) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase', {
        useNewConnection: true
    });
    try {
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
            [novel_id, readerProgress, chapterIndex]
        );
        console.log('Upserted novel chapter');
    } catch (error) {
        console.error('Error upserting novel chapter: ', error);
    }
}

async function getAllNovelChapters(novelId: number) {
    try {
        const db = await SQLite.openDatabaseAsync('luxreadDatabase');
        const allRows: NovelRow[] = await db.getAllAsync(
            `SELECT * FROM novelChapters WHERE novel_id = ?`,
            [novelId]
        );
        const librarySavedNovels = []

        for (const row of allRows) {
            librarySavedNovels.push({
                id: row.id,
                novelId: row.novel_id,
                readerProgress: row.readerProgress,
                chapterIndex: row.chapterIndex,
            });
        }

        if (allRows.length === 0) {
            console.log('no data to output');
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
    try {
        const db = await SQLite.openDatabaseAsync('luxreadDatabase');
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
            console.log('no data to output');
        }

        return librarySavedNovels;
    } catch (error) {
        console.error('Error fetching library novels:', error);
        return [];
    }
}

async function getNovelsBySource(novelSource: string) {
    try {
        const db = await SQLite.openDatabaseAsync('luxreadDatabase');
        const allRows: NovelRow[] = await db.getAllAsync(
            `SELECT id, title FROM libraryNovels WHERE novelSource = ?`,
            [novelSource]
        );

        const librarySavedNovels = allRows.map(row => ({
            id: row.id,
            title: row.title,
        }));

        if (librarySavedNovels.length === 0) {
            console.log('no data to output');
        }

        return librarySavedNovels;
    } catch (error) {
        console.error('Error fetching library novels:', error);
        return [];
    }
}


async function deleteLibraryNovel(novelId: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
    try {
        await db.execAsync(`DELETE FROM libraryNovels WHERE id = ${novelId}`);
        console.log(`Table "libraryNovels" ${novelId} cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear ${novelId} from table "libraryNovels": `, error);
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

export { clearTable, getAllNovelChapters, setupLibraryNovelsTable, insertLibraryNovel, getAllLibraryNovels, dropTable, deleteLibraryNovel, getTableStructure, getNovelsBySource, setupNovelChaptersTable, upsertNovelChapter };
