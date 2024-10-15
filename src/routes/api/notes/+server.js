import {json} from '@sveltejs/kit';
import sqlite3 from 'sqlite3';

sqlite3.verbose();
console.log(import.meta.env.VITE_APP_DB_FILE_NAME, import.meta.env);
const dbFileName = import.meta.env.VITE_APP_DB_FILE_NAME || 'db-prod.sqlite3';
console.log(dbFileName);

export async function GET() {
    sqlite3.verbose();
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });

    const selectSQL = `SELECT *
                       FROM notes`;
    let notes = [];
    try {
        notes = await new Promise((resolve, reject) => {
            db.all(selectSQL, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    } catch (err) {
        return json({error: `Failed to retrieve event: ${err.message}`}, {status: 500});
    } finally {
        db.close();
    }

    return json(notes);
}


export async function PUT({request}) {
    const note = await request.json();
    console.log('Update Note', note);

    sqlite3.verbose();
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });

    const columns = Object.keys(note);
    const placeholders = columns.map(col => `${col} = ?`).join(', ');
    const updateSQL = `UPDATE notes
                       SET ${placeholders}
                       WHERE id = ?`;
    const updateValues = [...columns.map(col => note[col]), note.id];

    console.log(updateSQL); // For debugging
    console.log(updateValues);

    try {
        await new Promise((resolve, reject) => {
            db.run(updateSQL, updateValues, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        const selectSQL = `SELECT * FROM notes WHERE id = ?`;
        const updatedNote = await new Promise((resolve, reject) => {
            db.get(selectSQL, [note.id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        db.close();
        return json(updatedNote);

    } catch (err) {
        return json({error: `Failed to update note: ${err.message}`}, {status: 500});
    } finally {
        db.close();
    }

    return json({message: 'Note updated successfully'});
}

export async function POST({ request }) {
    const note = await request.json();
    console.log('Create Note', note);
    sqlite3.verbose();
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });
    const columns = Object.keys(note);
    const placeholders = columns.map(() => '?').join(', ');
    const insertSQL = `INSERT INTO notes (${columns.join(', ')})
                       VALUES (${placeholders})`;
    const insertValues = columns.map(col => note[col]);
    console.log(insertSQL); // For debugging
    console.log(insertValues);

    let lastID;
    try {
        lastID = await new Promise((resolve, reject) => {
            db.run(insertSQL, insertValues, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    } catch (err) {
        return json({ error: `Failed to create note: ${err.message}` }, { status: 500 });
    }

    console.log('lastID', lastID);

    const selectSQL = `SELECT * FROM notes WHERE id = ?`;
    const newNote = await new Promise((resolve, reject) => {
        db.get(selectSQL, [lastID], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });

    db.close();
    return json(newNote);
}
