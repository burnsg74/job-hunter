import { test, expect, chromium } from "@playwright/test";
import sqlite3 from "sqlite3";
import dotenv from "dotenv";

sqlite3.verbose();
dotenv.config();

test("getjobs", async () => {
    test.setTimeout(0);

    const dbFileName = "/Users/greg/Code/local/jobs/db-prod.sqlite3";
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });

    const excitingJkList = await new Promise((resolve, reject) => {
        db.all(`SELECT jk
                FROM jobs`, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const jkList = rows.map((row) => row.jk);
                resolve(jkList);
            }
        });
    });

    console.log("excitingJkList", excitingJkList.length);

    const jobTitles = [
        "Senior Full Stack Engineer",
        "Senior Full Stack Developer",
        "PHP Developer",
        "Full Stack",
        "Senior Full Stack Engineer",
        "Senior Full Stack Developer",
        "Full Stack Engineer",
        "Full Stack Developer",
        "Lead Full Stack Engineer",
        "Lead Full Stack Developer",
        "Full Stack Software Engineer",
        "Full Stack Software Developer",
        "PHP Developer",
        "JavaScript Developer",
        "Senior Software Engineer",
        "Web Developer"
    ];
    const userDataDir = '/Users/greg/Library/Application Support/Google/Chrome/Profile 1';
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false, // Set to true if you want to run in headless mode
    });
    let jobTitle = "Senior Full Stack Engineer";
    let page = await context.newPage();
    const url = "https://www.indeed.com/jobs?q=" + jobTitle.replace(" ", "+") + "&l=Remote&fromage=3";
    console.log("URL", url);
    await page.goto(url);
    await page.pause();
    //
    // for (const jobTitle of jobTitles) {
    //     console.log("Query for ", jobTitle);
    //
    //     page.on("console", (msg) => {
    //         if (msg.type() === "debug") {
    //             console.log(msg.text());
    //         }
    //     });
    //
    //     const url = "https://www.indeed.com/jobs?q=" + jobTitle.replace(" ", "+") + "&l=Remote&fromage=3";
    //     console.log("URL", url);
    //     await page.goto(url);
    //     await page.pause();
    //     await page.waitForLoadState("networkidle");
    //     await new Promise((resolve) =>
    //         setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)),
    //     );
    //
    //     let pageNumber = 0;
    //     while (true) {
    //         pageNumber++;
    //         await new Promise((resolve) => setTimeout(resolve, 2000));
    //
    //         const jobData = await page.evaluate(async (excitingJkList) => {
    //             console.log("v Get Page Data v");
    //             const jobcardsDiv = document.getElementById("mosaic-provider-jobcards");
    //             const jobcardslinks = jobcardsDiv.querySelectorAll("a.jcs-JobTitle");
    //             const jobs = [];
    //             const jobLogMessages = [];
    //
    //             for (const aElement of Array.from(jobcardslinks)) {
    //                 const title = aElement.querySelector("span").innerText;
    //                 const jk = aElement.getAttribute("data-jk");
    //                 console.log("Job: ", jk);
    //
    //                 if (excitingJkList.includes(jk)) {
    //                     jobLogMessages.push(
    //                         `Job: ${title} (${title}) Already Existed; Skip`,
    //                     );
    //                     continue;
    //                 }
    //
    //                 jobLogMessages.push(`New Job: ${title} (${title})`);
    //                 excitingJkList.push(jk);
    //
    //                 const href = aElement.getAttribute("href");
    //                 aElement.click();
    //                 await new Promise((resolve) => setTimeout(resolve, 3000));
    //
    //                 const JobComponent = document.querySelector(
    //                     ".jobsearch-JobComponent",
    //                 );
    //                 const companyElement = JobComponent.querySelector(
    //                     'div[data-testid="inlineHeader-companyName"] a',
    //                 );
    //                 const company = companyElement
    //                     ? companyElement.childNodes[0].nodeValue.trim()
    //                     : null;
    //                 const companyLink =
    //                     companyElement && companyElement.getAttribute("href");
    //                 const salaryElement = JobComponent.querySelector(
    //                     "#salaryInfoAndJobType > span",
    //                 );
    //                 const salary = salaryElement
    //                     ? salaryElement.textContent
    //                     : null;
    //                 const jobDescriptionElement = JobComponent.querySelector(
    //                     "#jobDescriptionText",
    //                 );
    //                 let postHTML = jobDescriptionElement
    //                     ? jobDescriptionElement.outerHTML
    //                     : "";
    //                 postHTML = postHTML
    //                     .replace(/<img[^>]*>/g, "")
    //                     .replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, "")
    //                     .replace(/<button[^>]*>[\s\S]*?<\/button>/g, "");
    //
    //                 jobs.push({
    //                     jk,
    //                     postHTML,
    //                     href,
    //                     title,
    //                     company,
    //                     companyLink,
    //                     salary,
    //                 });
    //             }
    //             return {jobs, jobLogMessages};
    //         }, excitingJkList);
    //         console.log("^ Got page Data");
    //         const {jobs, jobLogMessages} = jobData;
    //         for (const job of jobs) {
    //             const {jk, postHTML, href, title, company, companyLink, salary} = job;
    //
    //             console.log("Add Job to DB:", jk, title);
    //             const match_percentage = null
    //             const tech_stack = null
    //             const lastID = await new Promise((resolve, reject) => {
    //                 db.run(
    //                     `INSERT INTO jobs (jk, status, post_html, notes, link, title, company, company_link, salary,
    //                                        new_date, search_query)
    //                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE ( CURRENT_TIMESTAMP), ?)`,
    //                     [
    //                         jk,
    //                         "New",
    //                         postHTML,
    //                         "",
    //                         "https://www.indeed.com" + href,
    //                         title,
    //                         company,
    //                         companyLink,
    //                         salary,
    //                         jobTitle
    //                     ],
    //                     function (err) {
    //                         if (err) {
    //                             console.log("Insert error:", jk);
    //                             resolve(null);
    //                         } else {
    //                             resolve(this.lastID);
    //                         }
    //                     },
    //                 );
    //             });
    //             console.log("lastID", lastID);
    //         }
    //
    //         const nextPageLink = await page.$(
    //             'a[data-testid="pagination-page-next"]',
    //         );
    //         if (nextPageLink) {
    //             console.log("Next Page");
    //             await nextPageLink.click();
    //             await page.waitForLoadState("networkidle");
    //         } else {
    //             console.log("STOP");
    //             break;
    //         }
    //     }
    // }
    db.close();
});
