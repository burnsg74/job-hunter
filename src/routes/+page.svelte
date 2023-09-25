<script>
    import {jobs} from "$lib/store.js"
    import JobCard from "$lib/components/JobCard.svelte";

    let jobList = {'new': [], 'saved': [], 'applied': [], 'interviewing': [], 'archived': []};
    $: {
        jobList = $jobs;
    }
</script>

<div class="row">
    <div class="col">
        <h1>Job Hunter</h1>
    </div>
</div>

<div class="row mb-3">
    <div class="col-4">
        <JobCard icon='bi-inboxes'
                 title="Inbox"
                 description="Jobs that need to be reviewed"
                 count={jobList['new'].length ?? 0}
                 route="new"
        />
    </div>
</div>

<div class="row mb-3">
    <div class="col">
        <JobCard icon='bi-inboxes'
                 title="Saved"
                 description="Jobs that looks like a good match"
                 count={jobList['saved'].length ?? 0}
                 route="saved"
        />
    </div>
    <div class="col">
        <div class="col">
            <JobCard icon='bi-inboxes'
                     title="Applied"
                     description="Waiting on Interview or Archive"
                     count={jobList['applied'].length ?? 0}
                     route="applied"
            />
        </div>
    </div>
    <div class="col">
        <JobCard icon='bi-inboxes'
                 title="Interviewing"
                 description="Jobs with at least one date for an Interview"
                 count={jobList['interviewing'].length ?? 0}
                 route="interviewing"
        />
    </div>
</div>
<div class="row mb-3">
    <div class="col-4">
        <JobCard icon='bi-inboxes'
                 title="Archived"
                 description="Jobs that are note a good match"
                 count={jobList['archived'].length ?? 0}
                 route="archived"
        />
    </div>
</div>

