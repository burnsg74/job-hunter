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

    const jobTitles = [
        'Senior Full Stack Engineer',
        'Senior Full Stack Developer',
        'Senior PHP Engineer',
        'Senior PHP Developer',
        'Full Stack Developer',
    ];

    for (const jobTitle of jobTitles) {

        // fromage=3
        // https://www.indeed.com/jobs?q=php&l=remote&fromage=3&vjk=9dfbe3f6765dec12
        await page.goto('https://www.indeed.com/');
        await page.getByPlaceholder('Job title, keywords, or').fill('Full Stack Developer');
        await page.getByPlaceholder('City, state, zip code, or "').fill('Remote');
        await page.getByRole('button', {name: 'Search'}).click();
        await page.waitForLoadState('networkidle');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // await page.getByLabel('Clear Last 24 hours filter').click();
        // await page.click('a#filter-dateposted');
        // await page.getByRole('link', {name: 'Last 14 days'}).click();
        // await page.getByRole('link', { name: 'Last 3 days' }).click();
        // await page.getByRole('link', { name: 'Last 7 days' }).click();
        while (true) {
            const jobData = await page.evaluate(async (excitingJkList) => {
                const jobcardsDiv = document.getElementById('mosaic-provider-jobcards');
                const jobcardslinks = jobcardsDiv.querySelectorAll('a.jcs-JobTitle')
                const jobs = [];
                for (const aElement of Array.from(jobcardslinks)) {
                    const title = aElement.querySelector('span').innerText;
                    const jk = aElement.getAttribute('data-jk');

                    if (excitingJkList.includes(jk)) {
                        console.log('Skipping', jk);
                        continue;
                    }
                    excitingJkList.push(jk);
                    const href = aElement.getAttribute('href');
                    aElement.click();
                    await new Promise(resolve => setTimeout(resolve, 3000));

                    const JobComponent = document.querySelector('.jobsearch-JobComponent');

                    // Get Company Name and link
                    const companyElement = JobComponent.querySelector('div[data-testid="inlineHeader-companyName"] a');
                    const company = companyElement ? companyElement.childNodes[0].nodeValue.trim() : null;
                    const companyLink = companyElement && companyElement.getAttribute('href');

                    // Get Salary
                    const salaryElement = JobComponent.querySelector('div[data-testid="jobsearch-CollapsedEmbeddedHeader-salary"] span');
                    const salary = salaryElement ? salaryElement.textContent : 'Pay information not provided';

                    const jobDescriptionElement = JobComponent.querySelector('#jobDescriptionText');
                    let postHTML = jobDescriptionElement ? jobDescriptionElement.outerHTML : '';
                    postHTML = postHTML.replace(/<img[^>]*>/g, '').replace(/<svg[^>]*>[\s\S]*?<\/svg>/g, '').replace(/<button[^>]*>[\s\S]*?<\/button>/g, '');

                    jobs.push({jk, postHTML, href, title, company, companyLink, salary});
                }
                return jobs;
            }, excitingJkList);

            for (const job of jobData) {
                const {jk, postHTML, href, title, company, companyLink, salary} = job;
                const lastID = await new Promise((resolve, reject) => {
                    db.run(`INSERT INTO jobs (jk, status, post_html, notes, link, title, company, company_link, salary,
                                              new_date, search_query)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, DATE ( CURRENT_TIMESTAMP),
                                    ?)`, [jk, 'New', postHTML, '', 'https://www.indeed.com' + href, title, company, companyLink, salary, 'Full Stack Developer'], function (err) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(this.lastID);
                        }
                    });
                });
                console.log('lastID', lastID);
            }

            const nextPageLink = await page.$('a[data-testid="pagination-page-next"]');
            if (nextPageLink) {
                await nextPageLink.click();
                await page.waitForLoadState('networkidle');
            } else {
                break;
            }
        }

    }
    db.close();

});