import * as SQLite from 'expo-sqlite';

const DB_NAME = 'luxreadDatabase';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!dbPromise) {
        dbPromise = (async () => {
            const db = await SQLite.openDatabaseAsync(DB_NAME);
            await db.execAsync(`
                PRAGMA journal_mode = WAL;
                PRAGMA foreign_keys = ON;
            `);
            return db;
        })().catch((error) => {
            dbPromise = null; // allow retry on next call
            throw error;
        });
    }
    return dbPromise;
}

const CREATE_SOURCES = `
    CREATE TABLE IF NOT EXISTS sources
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sourceName TEXT NOT NULL,
        sourceBaseUrl TEXT NOT NULL,
        baseImage TEXT NOT NULL,
        UNIQUE(sourceName)
    );
`;

const CREATE_LIBRARY_NOVELS = `
    CREATE TABLE IF NOT EXISTS libraryNovels
    (
        id TEXT PRIMARY KEY NOT NULL UNIQUE,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        description TEXT NOT NULL,
        genres TEXT NOT NULL,
        chapterCount INTEGER NOT NULL,
        imageURL TEXT NOT NULL,
        novelPageURL TEXT NOT NULL,
        novelSource TEXT NOT NULL,
        novelStatus TEXT NOT NULL,
        UNIQUE(id, novelPageURL),
        FOREIGN KEY (novelSource) REFERENCES sources(sourceName) ON DELETE CASCADE ON UPDATE CASCADE
    );
`;

const CREATE_NOVEL_CHAPTERS = `
    CREATE TABLE IF NOT EXISTS novelChapters
    (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        novel_id TEXT NOT NULL,
        readerProgress FLOAT NOT NULL,
        chapterIndex INTEGER NOT NULL,
        UNIQUE(novel_id),
        FOREIGN KEY(novel_id) REFERENCES libraryNovels(id)
    );
`;

const CREATE_DOWNLOADED_CHAPTERS = `
    CREATE TABLE IF NOT EXISTS downloadedChapters
    (
        downloadId INTEGER PRIMARY KEY AUTOINCREMENT,
        chapterTitle TEXT NOT NULL,
        chapterText TEXT NOT NULL,
        chapterPageURL TEXT NOT NULL,
        novel_id TEXT NOT NULL,
        FOREIGN KEY (novel_id) REFERENCES libraryNovels(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
`;

const DEFAULT_SOURCES = [
    ['AllNovelFull', 'https://allnovelfull.net/', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyjJn_YwCifVmvArmnCMIVroxl61obyCE5WQ&s'],
    ['NovelBin', 'https://novelbin.com/', 'https://novelbin.com/img/logo.png'],
    ['ReadNovelFull', 'https://readnovelfull.com/', 'https://readnovelfull.com/img/logo.png'],
] as const;

async function seedDefaultSources(db: SQLite.SQLiteDatabase) {
    const stmt = await db.prepareAsync(
        `INSERT OR IGNORE INTO sources (sourceName, sourceBaseUrl, baseImage) VALUES (?, ?, ?)`
    );
    try {
        for (const source of DEFAULT_SOURCES) {
            const result = await stmt.executeAsync([...source]);
            await result.resetAsync();
        }
    } finally {
        await stmt.finalizeAsync();
    }
}

async function setupDatabase() {
    const db = await getDb();
    try {
        await db.withTransactionAsync(async () => {
            await db.execAsync(
                CREATE_SOURCES + CREATE_LIBRARY_NOVELS + CREATE_NOVEL_CHAPTERS + CREATE_DOWNLOADED_CHAPTERS
            );
            await seedDefaultSources(db);
        });
        console.log('Database set up');
    } catch (error) {
        console.error('Error setting up database:', error);
        throw error;
    }
}

async function dropAllTables() {
    const db = await getDb();
    await db.execAsync('PRAGMA foreign_keys = OFF;');
    try {
        await db.withTransactionAsync(async () => {
            const tables = await db.getAllAsync<{ name: string }>(
                `SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'`
            );
            for (const { name } of tables) {
                await db.execAsync(`DROP TABLE IF EXISTS "${name.replace(/"/g, '""')}"`);
            }
        });
        console.log('Dropped all tables');
    } catch (error) {
        console.error('Failed to drop all tables:', error);
        throw error;
    } finally {
        await db.execAsync('PRAGMA foreign_keys = ON;');
    }
}

async function resetDatabase() {
    await dropAllTables();
    await setupDatabase();
}

async function setupSourcesTable() {
    const db = await getDb();
    try {
        await db.withTransactionAsync(async () => {
            await db.execAsync(CREATE_SOURCES);
            await seedDefaultSources(db);
        });
    } catch (error) {
        console.error('Error creating Sources table ', error);
    }
}

async function setupLibraryNovelsTable() {
    const db = await getDb();
    try {
        await db.execAsync(CREATE_LIBRARY_NOVELS);
    } catch (error) {
        console.error('Error creating LibraryNovels table ', error);
    }
}

async function setupNovelChaptersTable() {
    const db = await getDb();
    try {
        await db.execAsync(CREATE_NOVEL_CHAPTERS);
    } catch (error) {
        console.error('Error creating novelChapters table ', error);
    }
}

async function setupDownloadedChaptersTable() {
    const db = await getDb();
    try {
        await db.execAsync(CREATE_DOWNLOADED_CHAPTERS);
    } catch (error) {
        console.error('Error creating downloadedChapters table ', error);
    }
}

interface SourcesRows {
    id: number;
    sourceName: string;
    sourceBaseUrl: string;
    baseImage: string;
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
    novelStatus: string;
}

interface ChapterRow {
    id: number;
    novel_id: string;
    readerProgress: number;
    chapterIndex: number;
}

interface DownloadedChapterRow {
    downloadId: number;
    chapterTitle: string;
    chapterText: string | string[];
    chapterPageURL: string;
    novel_id: number;
}

interface DownloadedChapterContent {
    title: string;
    content: string[] | string;
    closeChapters: { [chapterTitle: string]: string | undefined };
}

export interface DownloadedChapterInput {
    chapterTitle: string;
    chapterText: string;
    chapterPageURL: string;
}

async function getTableStructure(tableName: string) {
    try {
        const db = await getDb();
        const tableInfo = await db.getAllAsync(`PRAGMA table_info(${tableName});`);
        console.log(`Structure of table "${tableName}":`, tableInfo);
        return tableInfo;
    } catch (error) {
        console.error(`Failed to get structure of table "${tableName}":`, error);
        return;
    }
}

async function clearTable(tableName: string) {
    try {
        const db = await getDb();
        await db.execAsync(`DELETE FROM ${tableName}`);
        console.log(`Table "${tableName}" cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear table "${tableName}":`, error);
    }
}

async function dropTable(tableName: string) {
    try {
        const db = await getDb();
        await db.execAsync(`DROP TABLE IF EXISTS ${tableName}`);
        console.log(`Table "${tableName}" dropped successfully.`);
    } catch (error) {
        console.error(`Failed to drop table "${tableName}":`, error);
    }
}

async function getSources(): Promise<SourcesRows[]> {
    try {
        const db = await getDb();
        return await db.getAllAsync<SourcesRows>(
            `SELECT id, sourceName, sourceBaseUrl, baseImage FROM sources ORDER BY sourceName ASC`
        );
    } catch (error) {
        console.error('Error fetching sources', error);
        return [];
    }
}

const NOVEL_COLUMNS = `id, title, author, description, genres, chapterCount, imageURL, novelPageURL, novelSource, novelStatus`;

const UPDATABLE_NOVEL_COLUMNS = new Set([
    'title', 'author', 'description', 'genres', 'chapterCount',
    'imageURL', 'novelPageURL', 'novelSource', 'novelStatus',
]);

async function insertLibraryNovel(
    title: string,
    author: string,
    description: string,
    genres: string,
    chapterCount: number,
    imageURL: string,
    novelPageURL: string,
    novelSource: string,
    novelStatus: string
) {
    try {
        const db = await getDb();
        const result = await db.runAsync(
            `INSERT INTO libraryNovels (id, title, author, description, genres, chapterCount, imageURL, novelPageURL, novelSource, novelStatus)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [`${title}-${novelSource}`,title, author, description, genres, chapterCount, imageURL, novelPageURL, novelSource, novelStatus]
        );
        console.log(`Novel "${title}" by ${author} added (rowid ${result.lastInsertRowId})`);
        return result.lastInsertRowId;
    } catch (error: any) {
        if (error?.message?.includes('UNIQUE constraint failed')) {
            console.error('Error: Novel with the same title, author, novelPageURL already exists.');
        } else {
            console.error('Insert for TABLE libraryNovels failed due to:', error);
        }
        return;
    }
}

async function getAllLibraryNovels(tableName: string = 'libraryNovels'): Promise<NovelRow[]> {
    try {
        const db = await getDb();
        return await db.getAllAsync<NovelRow>(`SELECT * FROM ${tableName}`);
    } catch (error) {
        console.error('Error fetching library novels:', error);
        return [];
    }
}

async function getLibraryNovelForUpdateById(novelId: number): Promise<NovelRow[]> {
    try {
        const db = await getDb();
        return await db.getAllAsync<NovelRow>(
            `SELECT ${NOVEL_COLUMNS} FROM libraryNovels WHERE id = ?`,
            [novelId]
        );
    } catch (error) {
        console.error('Error fetching library novel by id:', error);
        return [];
    }
}

async function updateNovelData(novelId: number, data: Record<string, any>) {
    const columns = Object.keys(data).filter((key) => UPDATABLE_NOVEL_COLUMNS.has(key));
    if (columns.length === 0) {
        console.log('updateNovelData: nothing to update');
        return;
    }

    const setClause = columns.map((column) => `${column} = ?`).join(', ');
    const values = columns.map((column) => data[column]);

    try {
        const db = await getDb();
        await db.runAsync(`UPDATE libraryNovels SET ${setClause} WHERE id = ?`, [...values, novelId]);
        console.log('Update successful');
    } catch (error) {
        console.error('Error updating novel data', error);
    }
}

async function getNovelsBySource(novelSource: string) {
    try {
        const db = await getDb();
        return await db.getAllAsync<{ id: number; title: string }>(
            `SELECT id, title FROM libraryNovels WHERE novelSource = ?`,
            [novelSource]
        );
    } catch (error) {
        console.error('Error fetching library novels:', error);
        return [];
    }
}

async function deleteLibraryNovel(novelId: number) {
    try {
        const db = await getDb();
        await db.withTransactionAsync(async () => {
            await db.runAsync(`DELETE FROM novelChapters WHERE novel_id = ?`, [novelId]);
            await db.runAsync(`DELETE FROM libraryNovels WHERE id = ?`, [novelId]);
        });
        console.log(`Novel ${novelId} deleted successfully.`);
    } catch (error) {
        console.error(`Failed to delete novel ${novelId}: `, error);
    }
}

async function upsertNovelChapter(novelTitle: string, novelSource: string, readerProgress: number, chapterIndex: number) {
    try {
        const db = await getDb();
        const novelId = `${novelTitle}-${novelSource}`;

        const result = await db.runAsync(
            `INSERT INTO novelChapters (novel_id, readerProgress, chapterIndex)
            VALUES (?, ?, ?)
            ON CONFLICT(novel_id)
            DO UPDATE SET
                readerProgress = CASE
                    WHEN excluded.chapterIndex > novelChapters.chapterIndex
                        OR (excluded.chapterIndex = novelChapters.chapterIndex
                            AND excluded.readerProgress > novelChapters.readerProgress)
                    THEN excluded.readerProgress
                    ELSE novelChapters.readerProgress
                END,
                chapterIndex = CASE
                    WHEN excluded.chapterIndex > novelChapters.chapterIndex
                    THEN excluded.chapterIndex
                    ELSE novelChapters.chapterIndex
                END;`,
            [novelId, readerProgress, chapterIndex]
        );

        if (result.changes === 0) {
            console.log(`No novel saved with the title: ${novelTitle}`);
            return;
        }
        console.log('Upserted novel chapter', novelId, readerProgress, chapterIndex);
    } catch (error) {
        console.error('Error upserting novel chapter: ', error);
    }
}

async function getAllNovelChapters(novelId: string): Promise<ChapterRow[]> {
    try {
        const db = await getDb();
        return await db.getAllAsync<ChapterRow>(
            `SELECT nc.id, nc.novel_id, nc.readerProgress, nc.chapterIndex
             FROM novelChapters nc
             JOIN libraryNovels ln ON ln.id = nc.novel_id
             WHERE ln.id = ?`,
            [novelId]
        );
    } catch (error) {
        console.error('Error fetching library novel chapters:', error);
        return [];
    }
}

async function deleteNovelChapters(novelId: number) {
    try {
        const db = await getDb();
        await db.runAsync(`DELETE FROM novelChapters WHERE novel_id = ?`, [novelId]);
        console.log(`Table "novelChapters" ${novelId} cleared successfully.`);
    } catch (error) {
        console.error(`Failed to clear ${novelId} from table "novelChapters": `, error);
    }
}

async function insertDownloadedChapter(
    chapterTitle: string,
    chapterText: string,
    chapterPageURL: string,
    novel_id: number
): Promise<number | null> {
    try {
        const db = await getDb();
        const result = await db.runAsync(
            `INSERT INTO downloadedChapters (chapterTitle, chapterText, chapterPageURL, novel_id) VALUES (?, ?, ?, ?)`,
            [chapterTitle, JSON.stringify(chapterText), chapterPageURL, novel_id]
        );
        return result.lastInsertRowId ?? null;
    } catch (error) {
        console.error('Insert for TABLE downloadedChapters failed due to:', error);
        return null;
    }
}

/**
 * Bulk insert inside ONE transaction using a single prepared statement:
 * one commit/fsync instead of one per chapter, and the statement is compiled
 * once. Either every chapter is stored or none are (on error, it rolls back).
 * Chapters already downloaded for this novel (same title) are skipped.
 *
 * @returns number of chapters actually inserted (0 on failure)
 */
async function insertDownloadedChapters(
    chapters: DownloadedChapterInput[],
    novel_id: number | string
): Promise<number> {
    if (chapters.length === 0) return 0;

    try {
        const db = await getDb();
        let inserted = 0;

        await db.withTransactionAsync(async () => {
            const stmt = await db.prepareAsync(
                `INSERT OR IGNORE INTO downloadedChapters (chapterTitle, chapterText, chapterPageURL, novel_id)
                 VALUES (?, ?, ?, ?)`
            );
            try {
                for (const chapter of chapters) {
                    const result = await stmt.executeAsync([
                        chapter.chapterTitle,
                        JSON.stringify(chapter.chapterText),
                        chapter.chapterPageURL,
                        novel_id,
                    ]);
                    inserted += result.changes;
                    await result.resetAsync();
                }
            } finally {
                await stmt.finalizeAsync();
            }
        });

        console.log(`Inserted ${inserted}/${chapters.length} downloaded chapters for novel ${novel_id}`);
        return inserted;
    } catch (error) {
        console.error('Bulk insert for TABLE downloadedChapters failed (rolled back):', error);
        return 0;
    }
}

async function getDownloadedChapters(novelId: number) {
    try {
        const db = await getDb();
        const rows = await db.getAllAsync<DownloadedChapterRow>(
            `SELECT downloadId, chapterTitle, chapterText, chapterPageURL, novel_id
             FROM downloadedChapters
             WHERE novel_id = ?
             ORDER BY CAST(SUBSTR(chapterTitle, INSTR(chapterTitle, ' ') + 1) AS INTEGER) ASC`,
            [novelId]
        );

        if (rows.length === 0) {
            console.log('No chapters found downloaded for this novel', novelId);
        }

        return rows.map((row) => ({
            id: row.downloadId,
            title: row.chapterTitle,
            content: row.chapterText,
            chapterPageURL: row.chapterPageURL,
            novel_id: row.novel_id,
        }));
    } catch (error) {
        console.error('Error fetching downloaded novel chapters:', error, ' for ', novelId);
        return [];
    }
}

export async function isChapterDownloaded(chapterPageURL: string, novelId: number): Promise<boolean> {
    const db = await getDb();
    // EXISTS-style lookup: stops at the first match instead of counting all rows.
    const row = await db.getFirstAsync<{ found: number }>(
        `SELECT 1 AS found FROM downloadedChapters WHERE chapterPageURL = ? AND novel_id = ? LIMIT 1`,
        [chapterPageURL, novelId]
    );
    return row !== null;
}

const extractChapterNumber = (title: string): number => {
    const match = title.match(/Chapter\s+(\d+)/);
    return match ? parseInt(match[1], 10) : NaN;
};

async function getDownloadedChapterContent(chapterPageURL: string): Promise<DownloadedChapterContent | null> {
    try {
        const db = await getDb();

        const currentChapter = await db.getFirstAsync<DownloadedChapterRow>(
            `SELECT chapterTitle, chapterText, novel_id FROM downloadedChapters WHERE chapterPageURL = ? LIMIT 1`,
            [chapterPageURL]
        );

        if (!currentChapter) {
            console.log('No chapter found with the provided URL');
            return null;
        }

        const siblings = await db.getAllAsync<Pick<DownloadedChapterRow, 'chapterTitle' | 'chapterPageURL'>>(
            `SELECT chapterTitle, chapterPageURL FROM downloadedChapters WHERE novel_id = ?`,
            [currentChapter.novel_id]
        );

        const sorted = siblings
            .map((row) => ({ number: extractChapterNumber(row.chapterTitle), url: row.chapterPageURL }))
            .filter((chapter) => !isNaN(chapter.number))
            .sort((a, b) => a.number - b.number);

        const currentNum = extractChapterNumber(currentChapter.chapterTitle);
        const index = sorted.findIndex((chapter) => chapter.number === currentNum);

        return {
            title: currentChapter.chapterTitle,
            content: currentChapter.chapterText,
            closeChapters: {
                prevChapter: index > 0 ? sorted[index - 1].url : undefined,
                nextChapter: index !== -1 && index < sorted.length - 1 ? sorted[index + 1].url : undefined,
            },
        };
    } catch (error) {
        console.error('Error fetching downloaded chapter content:', error);
        return null;
    }
}

export {
    // schema / lifecycle
    setupDatabase,
    dropAllTables,
    resetDatabase,
    setupSourcesTable,
    setupLibraryNovelsTable,
    setupNovelChaptersTable,
    setupDownloadedChaptersTable,
    // utilities
    clearTable,
    dropTable,
    getTableStructure,
    // sources
    getSources,
    // library novels
    insertLibraryNovel,
    getAllLibraryNovels,
    getLibraryNovelForUpdateById,
    updateNovelData,
    getNovelsBySource,
    deleteLibraryNovel,
    // reader progress
    upsertNovelChapter,
    getAllNovelChapters,
    deleteNovelChapters,
    // downloaded chapters
    insertDownloadedChapter,
    insertDownloadedChapters,
    getDownloadedChapters,
    getDownloadedChapterContent,
};