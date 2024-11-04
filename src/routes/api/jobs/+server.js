import { json } from "@sveltejs/kit";
import sqlite3 from "sqlite3";
// import { PUBLIC_DB_FILENAME } from "$env/static/public";

sqlite3.verbose();

export async function GET() {
  sqlite3.verbose();
  const db = new sqlite3.Database("db-prod.sqlite3", (err) => {
    if (err) {
      throw err;
    }
  });
  console.log("Connected to the database.", db);

  const selectSQL = `SELECT *
                       FROM jobs ORDER BY company, title`;
  let jobs = [];
  try {
    jobs = await new Promise((resolve, reject) => {
      db.all(selectSQL, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  } catch (err) {
    return json(
      { error: `Failed to retrieve event: ${err.message}` },
      { status: 500 },
    );
  } finally {
    db.close();
  }

  // Return the newly inserted event data as JSON
  return json(jobs);
}

export async function PUT({ request }) {
  const job = await request.json();
  console.log("Update Job", job);

  sqlite3.verbose();
  const db = new sqlite3.Database(PUBLIC_DB_FILENAME, (err) => {
    if (err) {
      throw err;
    }
  });

  const columns = Object.keys(job);
  const placeholders = columns.map((col) => `${col} = ?`).join(", ");
  const updateSQL = `UPDATE jobs
                       SET ${placeholders}
                       WHERE jk = ?`;
  const updateValues = [...columns.map((col) => job[col]), job.jk];

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
  } catch (err) {
    return json(
      { error: `Failed to update job: ${err.message}` },
      { status: 500 },
    );
  } finally {
    db.close();
  }

  return json({ message: "Job updated successfully" });
}
