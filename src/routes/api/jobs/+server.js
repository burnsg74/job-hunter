import { json } from "@sveltejs/kit";
import sqlite3 from "sqlite3";
import { error } from '@sveltejs/kit';

// import { PUBLIC_DB_FILENAME } from "$env/static/public";

sqlite3.verbose();

async function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

export async function GET() {
  console.log("Get Jobs");
  const db = new sqlite3.Database("/Users/greg/Code/local/jobs/db-prod.sqlite3", (err) => {
    if (err) {
      return json({ error: `Failed to open database: ${err.message}` }, { status: 500 });
    }
  });

  try {
    const jobs = await runQuery(db, `SELECT * FROM jobs ORDER BY company, title`);
    console.log("Jobs", jobs.length);
    return new Response(JSON.stringify(jobs));
  } catch (err) {
    return json({ error: `Failed to retrieve jobs: ${err.message}` }, { status: 500 });
  } finally {
    db.close();
  }
}

export async function PUT({ request }) {
  const job = await request.json();
  console.log("Update Job", job);

  const db = new sqlite3.Database('/Users/greg/Code/local/jobs/db-prod.sqlite3', (err) => {
    if (err) {
      return json({ error: `Failed to open database: ${err.message}` }, { status: 500 });
    }
  });

  const columns = Object.keys(job);
  const placeholders = columns.map(col => `${col} = ?`).join(', ');
  const updateSQL = `UPDATE jobs SET ${placeholders} WHERE jk = ?`;
  const updateValues = [...columns.map(col => job[col]), job.jk];

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
    return json({ message: "Job updated successfully" });
  } catch (err) {
    return json({ error: `Failed to update job: ${err.message}` }, { status: 500 });
  } finally {
    db.close();
  }
}