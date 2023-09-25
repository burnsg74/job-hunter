<script>
    import {jobs} from "$lib/store.js"
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import Database from "tauri-plugin-sql-api";

    let type = $page.params.type;
    let id = parseInt($page.params.id);

    let jobList = $jobs;
    let inboxCount = $jobs[type].length;
    $: {
        jobList = $jobs;
    }

    let index
    let job = jobList[type].find(job => job.id === id);

    index = jobList[type].indexOf(job);

    function handleSaveJob() {
        console.log('save job');
        Database.load("sqlite:job-hunter.sqlite").then((db) => {
            db.execute("UPDATE indeed_jobs SET status = ? WHERE id = ?", ['saved', job['id']]).then(() => {
                console.log('updated');
            });
        });

        job['status'] = 'saved';
        $jobs['saved'].push(job);
        $jobs[type].splice(index, 1);

        jobList = $jobs;
        inboxCount = jobList[type].length;
        console.log('count: ', jobList[type].length);

        if ($jobs[type].length === 0) {
            goto('/')
        }

        if ($jobs[type][index] === undefined) {
            index = 0;
        }

        const nextNewJob = $jobs[type][index];
        goto('/details/' + type + '/' + nextNewJob.id)

        job = nextNewJob;
        job['description'] = job.description.replace(/Angular/g, "<span class='text-danger'>Angular</span>");
        job['description'] = job.description.replace(/ Java /g, "<span class='text-danger'> Java </span>");
        job['description'] = job.description.replace(/JavaScript/g, "<span class='text-success'>JavaScript</span>");
        job['description'] = job.description.replace(/PHP/g, "<span class='text-success'>PHP</span>");
        job['description'] = job.description.replace(/Python/g, "<span class='text-success'>Python</span>");

        index++;
    }

    function handleArchiveJob() {
        Database.load("sqlite:job-hunter.sqlite").then((db) => {
            db.execute("UPDATE indeed_jobs SET status = ? WHERE id = ?", ['archived', job['id']]).then(() => {
                console.log('updated');
            });
        });

        job['status'] = 'archived';
        $jobs['archived'].push(job);
        $jobs[type].splice(index, 1);
        inboxCount = jobList[type].length;

        if ($jobs[type].length === 0) {
            goto('/')
        }

        if ($jobs[type][index] === undefined) {
            index = 0;
        }

        const nextNewJob = $jobs[type][index];
        console.log(nextNewJob);
        goto('/details/' + type + '/' + nextNewJob.id)
        job = nextNewJob;
    }

    function handleNext() {
        index++;
        if ($jobs[type][index] === undefined) {
            index = 0;
        }

        const nextNewJob = $jobs[type][index];
        goto('/details/'+ type +'/' + nextNewJob.id)
        job = nextNewJob;
    }

    function handlePrev() {
        index--;
        if ($jobs[type][index] === undefined) {
            index = $jobs[type].length - 1;
        }

        const nextNewJob = $jobs[type][index];
        goto('/details/'+ type +'/' + nextNewJob.id)
        job = nextNewJob;
    }
</script>

<nav aria-label="breadcrumb" style="margin-left: -10px">
    <ol class="breadcrumb bg-body-secondary ps-3">
        <li class="breadcrumb-item"><a href="/">Home</a></li>
        <li class="breadcrumb-item"><a href="/inbox">Inbox</a></li>
        <li class="breadcrumb-item active" aria-current="page">{job.company_name} :: {job.job_title} ({index + 1}
            of {inboxCount})
        </li>
    </ol>
</nav>
<div class="row">
    <div class="col-9">
        <div class="card">
            <div class="card-header">
                <h5 class="card-title mb-0">{job.job_title} - {job.subtitle}</h5>
            </div>
            <div class="card-body">
                {@html job.description}
            </div>
        </div>
    </div>
    <div class="col-3 fixed-column bg-body-secondary">
        {job.company_name}
        <hr>
        <div class="btn-group w-100" role="group" aria-label="Basic example">
            <button class="btn btn-secondary w-100 mb-2" on:click={handlePrev}>Prev Job</button>
            <button class="btn btn-success w-100 mb-2" on:click={handleSaveJob}>Save Job</button>
            <button class="btn btn-danger w-100 mb-2" on:click={handleArchiveJob}>Archive Job</button>
            <button class="btn btn-secondary w-100 mb-2" on:click={handleNext}>Next Job</button>
        </div>
        <hr>
        <table>
            <tr>
                <td>Posted At:</td>
                <th>{job.posted_at}</th>
            </tr>
            <tr>
                <td>Job Type:</td>
                <th>{job.job_type}</th>
            </tr>
            {#if job.salary_text}
                <tr>
                    <td>Salary:</td>
                    <th>{job.salary_text}</th>
                </tr>
            {/if}
            {#if job.urgently_hiring_text}
                <tr>
                    <th colspan="2">{job.urgently_hiring_text}</th>
                </tr>
            {/if}
        </table>
        <hr>
        <a class="btn btn-outline-primary w-100 mb-2" target="_blank" href="{job.job_link}">View Job</a>
        <a class="btn btn-outline-secondary w-100 mb-2" target="_blank" href="{job.company_overview_link}">Company
            Overview</a>
        <a class="btn btn-outline-info w-100 mb-2" target="_blank" href="{job.company_review_link}">Company Reviews</a>
    </div>
</div>

<style>
    .fixed-column {
        position: fixed;
        top: 0;
        right: 0;
        height: 100%;
        overflow-y: auto; /* Add scroll if needed */
    }
</style>
