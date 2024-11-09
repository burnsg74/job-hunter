import {test, expect} from "@playwright/test";
import sqlite3 from "sqlite3";
// import { io } from 'socket.io-client'
import dotenv from "dotenv";


sqlite3.verbose();
dotenv.config();

test("get-lickedin-jobs", async ({page}) => {

    await page.goto('https://www.linkedin.com/login');
    await page.waitForLoadState("networkidle");
    await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)),
    );

    await page.getByLabel('Email or phone').fill('gregburns74@gmail.com');
    await page.getByLabel('Password').fill('9Kclfl@Q8#P&rK');
    await page.getByLabel('Sign in', {exact: true}).click();

    await page.goto('https://www.linkedin.com/jobs/');
    await new Promise((resolve) =>
        setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)),
    );

    await page.getByRole('combobox', { name: 'Search by title, skill, or company' }).fill('Senior Full Stack Engineer');
    await page.keyboard.press('Enter');

    const jobs = await page.$$('.scaffold-layout__list-container li');
    for (const job of jobs) {
        await job.click();
        await new Promise((resolve) =>
            setTimeout(resolve, Math.floor(Math.random() * 4000 + 1000)),
        );

        // job-details-preferences-and-skills__pill

        const jobDetails = await page.$('div.jobs-box--fadein.jobs-box--full-width.jobs-box--with-cta-large.jobs-description.jobs-description--reformatted.job-details-module');
        if (jobDetails) {
            const jobTitle = await jobDetails.$eval('h2', node => node.innerText.trim());
            const jobLink = await jobDetails.$eval('a', node => node.href);

            console.log(`Job Title: ${jobTitle}`);
            console.log(`Job Link: ${jobLink}`);
        } else {
            console.log('Job details not found');
        }
    }

    await page.pause();
});