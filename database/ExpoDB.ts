import * as SQLite from 'expo-sqlite';

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
                UNIQUE(title, author, novelPageURL)
            );
        `);
        console.log('Created librarynovels table');
    } catch (error) {
       console.error('Error creating LibraryNovels table ', error) 
    }
}

async function insertLibraryNovel(title: string, author: string, chapterCount: number, imageURL: string, novelPageURL: string) {
    const db = await SQLite.openDatabaseAsync('luxreadDatabase');
    try {
        await db.runAsync(
          `INSERT INTO libraryNovels (title, author, chapterCount, imageURL, novelPageURL) VALUES (?, ?, ?, ?, ?)`,
          [title, author, chapterCount, imageURL, novelPageURL]
        );
        console.log(`Novel ${title}, written by ${author} succesfully added. Extra data: ${imageURL} and ${novelPageURL}`);
    } catch (error: any) {
        if (error.message.includes('UNIQUE constraint failed')) {
            console.error('Error: Novel with the same title, author, novelPageURL already exists.');
        } else {
            console.error('Insert for TABLE libraryNovels failed due to:', error);
        }
    }
}

async function getAllLibraryNovels(tableName: string) {
    try {
        const db = await SQLite.openDatabaseAsync('luxreadDatabase');
        const allRows = await db.getAllAsync(`SELECT * FROM ${tableName}`);
        const librarySavedNovels = [];

        for (const row of allRows) {
            librarySavedNovels.push({
                id: row.id,
                title: row.title,
                author: row.author,
                chapterCount: row.chapterCount,
                imageURL: row.imageURL,
                novelPageURL: row.novelPageURL
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

export { clearTable, setupLibraryNovelsTable, insertLibraryNovel, getAllLibraryNovels, dropTable, deleteLibraryNovel };
