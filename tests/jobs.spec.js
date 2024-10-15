import { test, expect } from '@playwright/test';
import sqlite3 from 'sqlite3';
sqlite3.verbose();

test('getjobs', async ({page}) => {
    test.setTimeout(0);
    const dbFileName = '/Users/greg/Code/local/job-hunter/db-dev.sqlite3'
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
    console.log('Job Count: ',excitingJkList.length);

    const jobTitles = [
        'Senior Full Stack Developer',
        'Senior Full Stack Engineer',
        'Senior PHP Engineer',
        'Senior PHP Developer',
        'Full Stack Developer',
    ];

    for (const jobTitle of jobTitles) {
        console.log ('Query for ',jobTitle)
        page.on('console', msg => {
            if (msg.type() === 'debug') {
                console.log(msg.text());
            }
        });

        // fromage=3
        // https://www.indeed.com/jobs?q=php&l=remote&fromage=3&vjk=9dfbe3f6765dec12
        await page.goto('https://www.indeed.com/');
        await page.getByPlaceholder('Job title, keywords, or').fill(jobTitle);
        await page.getByPlaceholder('City, state, zip code, or "').fill('Remote');
        await page.getByRole('button', {name: 'Search'}).click();
        await page.waitForLoadState('networkidle');

        while (true) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            const jobData = await page.evaluate(async (excitingJkList,jobTitle) => {
                console.log('v Get Page Data v');
                const jobcardsDiv = document.getElementById('mosaic-provider-jobcards');
                const jobcardslinks = jobcardsDiv.querySelectorAll('a.jcs-JobTitle')
                const jobs = [];
                for (const aElement of Array.from(jobcardslinks)) {
                    const title = aElement.querySelector('span').innerText;
                    const jk = aElement.getAttribute('data-jk');

                    if (excitingJkList.includes(jk)) {
                        continue;
                    }
                    excitingJkList.push(jk);

                    const href = aElement.getAttribute('href');
                    aElement.click();
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    const JobComponent = document.querySelector('.jobsearch-JobComponent');
                    const companyElement = JobComponent.querySelector('div[data-testid="inlineHeader-companyName"] a');
                    const company = companyElement ? companyElement.childNodes[0].nodeValue.trim() : null;
                    const companyLink = companyElement && companyElement.getAttribute('href');
                    const salaryElement = JobComponent.querySelector('div[data-testid="jobsearch-CollapsedEmbeddedHeader-salary"] span');
                    const salary = salaryElement ? salaryElement.textContent : 'Pay information not provided';
                    const jobDescriptionElement = JobComponent.querySelector('#jobDescriptionText');
                    let postHTML = jobDescriptionElement ? jobDescriptionElement.outerHTML : '';
                    postHTML = postHTML.replace(/<img[^>]*>/g, '').replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, '').replace(/<button[^>]*>[\s\S]*?<\/button>/g, '');

                    jobs.push({jk, postHTML, href, title, company, companyLink, salary});
                }
                return jobs;
            }, excitingJkList);
            console.log('^ Got page Data: excitingJkList Count: ',excitingJkList.length);

            console.log('Add Jobs to DB')
            for (const job of jobData) {
                const {jk, postHTML, href, title, company, companyLink, salary} = job;
                const lastID = await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO jobs (jk, status, post_html, notes, link, title, company, company_link, salary,
                                              new_date, search_query)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE ( CURRENT_TIMESTAMP),
                                    ?)`, [jk, 'New', postHTML, '', 'https://www.indeed.com' + href, title, company, companyLink, salary, jobTitle], function (err) {
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
                await nextPageLink.click();
                await page.waitForLoadState('networkidle');
            } else {
                console.log('STOP')
                break;
            }
        }

    }
    db.close();

});