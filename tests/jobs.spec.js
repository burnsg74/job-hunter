import { test, expect } from '@playwright/test';
import sqlite3 from 'sqlite3';
import { io } from 'socket.io-client'

sqlite3.verbose();

test('getjobs', async ({ page }) => {
    test.setTimeout(0);
    const socket = io(`http://localhost:3012`, {
        withCredentials: true
    });
    socket.emit('pullJobsLog', 'Pulling jobs');

    const dbFileName = '/Users/greg/Code/local/jobs/db-prod.sqlite3'
    const db = new sqlite3.Database(dbFileName, (err) => {
        if (err) {
            throw err;
        }
    });

    const excitingJkList = await new Promise((resolve, reject) => {
        db.all(`SELECT jk FROM jobs`, [], (err, rows) => {
            if (err) {
                reject(err);
            } else {
                const jkList = rows.map(row => row.jk);
                resolve(jkList);
            }
        });
    });

    const jobTitles = [
        'Senior Full Stack Developer',
        'Senior Full Stack Engineer',
        'Senior PHP Engineer',
        'Senior PHP Developer',
        'Full Stack Developer',
        'Full Stack Engineer',
        'Laravel',
    ];

    for (const jobTitle of jobTitles) {
        console.log('Query for ', jobTitle)
        socket.emit('pullJobsLog', `Pulling Jobs for: ${jobTitle}`);

        page.on('console', msg => {
            if (msg.type() === 'debug') {
                console.log(msg.text());
            }
        });

        socket.emit('pullJobsLog', `Goto Indeed and load first page of jobs...`);
        await page.goto("https://www.indeed.com/jobs?q=" + jobTitle.replace(' ', '+') + "&l=Remote&fromage=3");
        await page.pause()
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 6000 + 1000)));
        await page.evaluate(() => window.scrollBy(0, window.innerHeight));
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)));

        page.pause()
        await page.waitForLoadState('networkidle');

        let pageNumber = 0;
        while (true) {
            pageNumber++;
            socket.emit('pullJobsLog', `Page: ${pageNumber}, pause a few seconds..`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            const jobData = await page.evaluate(async (excitingJkList) => {
                console.log('v Get Page Data v');
                const jobcardsDiv = document.getElementById('mosaic-provider-jobcards');
                const jobcardslinks = jobcardsDiv.querySelectorAll('a.jcs-JobTitle')
                const jobs = [];
                const jobLogMessages = [];

                for (const aElement of Array.from(jobcardslinks)) {
                    const title = aElement.querySelector('span').innerText;
                    const jk = aElement.getAttribute('data-jk');
                    console.log('Job: ', jk);

                    if (excitingJkList.includes(jk)) {
                        jobLogMessages.push(`Job: ${title} (${title}) Already Existed; Skip`); // Store log message
                        continue;
                    }

                    jobLogMessages.push(`New Job: ${title} (${title})`);
                    excitingJkList.push(jk);

                    const href = aElement.getAttribute('href');
                    aElement.click();
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    const JobComponent = document.querySelector('.jobsearch-JobComponent');
                    const companyElement = JobComponent.querySelector('div[data-testid="inlineHeader-companyName"] a');
                    const company = companyElement ? companyElement.childNodes[0].nodeValue.trim() : null;
                    const companyLink = companyElement && companyElement.getAttribute('href');
                    const salaryElement = JobComponent.querySelector("#salaryInfoAndJobType > span");
                    const salary = salaryElement ? salaryElement.textContent : 'Pay information not provided';
                    const jobDescriptionElement = JobComponent.querySelector('#jobDescriptionText');
                    let postHTML = jobDescriptionElement ? jobDescriptionElement.outerHTML : '';
                    postHTML = postHTML.replace(/<img[^>]*>/g, '').replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, '').replace(/<button[^>]*>[\s\S]*?<\/button>/g, '');

                    jobs.push({ jk, postHTML, href, title, company, companyLink, salary });
                }
                return { jobs, jobLogMessages };
            }, excitingJkList);
            console.log('^ Got page Data');
            const { jobs, jobLogMessages } = jobData;
            jobLogMessages.forEach(message => {
                socket.emit('pullJobsLog', message);
            });

            for (const job of jobs) {
                const { jk, postHTML, href, title, company, companyLink, salary } = job;
                console.log('Add Job to DB:', jk, title);
                const lastID = await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO jobs (jk, status, post_html, notes, link, title, company, company_link, salary,
                                              new_date, search_query)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE ( CURRENT_TIMESTAMP),
                                    ?)`, [jk, 'New', postHTML, '', 'https://www.indeed.com' + href, title, company, companyLink, salary, jobTitle], function(err) {
                        if (err) {
                            console.log('Insert error:', jk);
                            resolve(null);
                        } else {
                            resolve(this.lastID);
                        }
                    });
                });
                console.log('lastID', lastID);
            }

            const nextPageLink = await page.$('a[data-testid="pagination-page-next"]');
            if (nextPageLink) {
                console.log('Next Page')
                socket.emit('pullJobsLog', 'Goto Next Page');
                await nextPageLink.click();
                await page.waitForLoadState('networkidle');
            } else {
                socket.emit('pullJobsLog', 'No more pages for this query');
                console.log('STOP')
                break;
            }
        }

    }
    db.close();

});
