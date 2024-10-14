<script>
    import {onMount} from "svelte";

    let jobs = [];
    let status = 'New';
    let currentJob = null;
    const statuses = ['New', 'Saved', 'Applied', 'Interview', 'Rejected', 'Deleted'];
    let currentJobStatusHasChanged = false;

    $: {
        const params = new URLSearchParams(window.location.search);
        status = params.get('status') ?? 'New';
    }

    async function fetchJobs() {
        console.log('Fetching jobs...', status);
        try {
            let response = await fetch('/api/jobs');
            jobs = await response.json();
            if (jobs.length > 0) {
                currentJob = jobs[0]; // Set using regular variable assignment
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    function handleStatusChange(event) {
        const selectedStatus = event.target.value;
        saveStatus(selectedStatus);
    }

    async function saveStatus(newStatus) {
        currentJob.status = newStatus;

        jobs = jobs.map(job => job.jk === currentJob.jk ? {...job, status: newStatus} : job);

        try {
            const response = await fetch('/api/jobs', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentJob),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            currentJob.status = newStatus;

            // Navigate to the next job with the same status
            let index = jobs.findIndex(j => j.jk === currentJob.jk);
            let nextJob = jobs.slice(index + 1).find(job => job.status === status);
            currentJob = nextJob ?? null;
        } catch (error) {
            console.error('Error updating status:', error);
        }
    }

    function handleKeyDown(event) {
        // console.log(`Key pressed: ${event.key}, Code: ${event.code}`);
        if (event.key === 'j' || event.key === 'ArrowDown') {
            let index = jobs.findIndex(j => j.jk === currentJob.jk);
            if (index !== -1) {
                for (let i = index + 1; i < jobs.length; i++) {
                    if (jobs[i].status === status) {
                        currentJob = jobs[i];
                        break;
                    }
                }
            }
        }
        if (event.key === 'k' || event.key === 'ArrowUp') {
            let index = jobs.findIndex(j => j.jk === currentJob.jk);
            if (index !== -1) {
                for (let i = index - 1; i >= 0; i--) {
                    if (jobs[i].status === status) {
                        currentJob = jobs[i];
                        break;
                    }
                }
            }
        }

        if (event.key === 'l' || event.key === 'ArrowLeft') {
            currentJobStatusHasChanged = true;
            let currentIndex = statuses.indexOf(currentJob.status);
            let nextIndex = currentIndex + 1;
            if (nextIndex >= statuses.length) nextIndex = 0;
            currentJob.status = statuses[nextIndex];
        }

        if (event.key === 'h' || event.key === 'ArrowRight') {
            currentJobStatusHasChanged = true;
            let currentIndex = statuses.indexOf(currentJob.status);
            let nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = statuses.length - 1;
            currentJob.status = statuses[nextIndex];
        }

        if (event.key === 'n') {
            saveStatus('New');
        } else if (event.key === 's') {
            saveStatus('Saved');
        } else if (event.key === 'a') {
            saveStatus('Applied');
        } else if (event.key === 'i') {
            saveStatus('Interview');
        } else if (event.key === 'r') {
            saveStatus('Rejected');
        } else if (event.key === 'd') {
            saveStatus('Deleted');
        }

        if (event.key === 'Tab') {
            event.preventDefault(); // Prevent default tab behavior
            let currentIndex = statuses.indexOf(status);
            if (currentIndex === -1) currentIndex = 0;
            let nextIndex = (currentIndex + 1) % statuses.length; // Move to the next index, wrap around to 0 if at end
            updateStatus(statuses[nextIndex]);
        }

        if (event.key === 'Enter') {
            saveStatus(currentJob.status);
            currentJobStatusHasChanged = false;
        }

        if (event.key === 'Escape') {
            currentJob.status = status;
            currentJobStatusHasChanged = false;
        }
    }

    function updateStatus(newStatus) {
        status = newStatus;
        currentJob = jobs.find(job => job.status === status);
    }

    onMount(() => {
        fetchJobs();
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    });
</script>
<div class="container-fluid">
    <div class="row border-bottom">
        {#each statuses as statusGroup}
            <div class="col-2 status-nav {statusGroup} {statusGroup === status ? 'active-group' : ''}"
                 on:click={() => updateStatus(statusGroup)}>
                {statusGroup} ({jobs.filter(job => job.status === statusGroup).length})
            </div>
        {/each}
    </div>
    <div class="row">
        <div class="col-2 jobs-left-col">
            {#each jobs.filter(job => job.status === status) as job}
                <div class="job-title {job.jk === currentJob?.jk ? 'active' : 'inactive'}"
                     on:click={() => currentJob = job}>
                    {job.title}
                </div>
            {/each}
            {#if jobs.filter(job => job.status === status).length === 0}
                <p class="empty">No {status.toLowerCase()} job listings found.</p>
            {/if}
        </div>
        <div class="col-10 jobs-right-col">
            {#if currentJob}
                <h1>{currentJob.title} &nbsp; <a href="{currentJob.link}" target="_blank"> <i
                        class="bi bi-arrow-up-right-square small-icon"></i></a></h1>

                <table>
                    <tr>
                        <td>Company:</td>
                        <td>
                            <strong>
                                {currentJob.company}
                                <a href="{currentJob.company_link}" target="_blank">
                                    <i class="bi bi-arrow-up-right-square"></i>
                                </a>
                            </strong>
                        </td>
                    </tr>
                    <tr>
                        <td>Salary:</td>
                        <td><strong>{currentJob.salary}</strong></td>
                    </tr>
                    <tr>
                        <td>Status:</td>
                        <td>
                            <select bind:value={currentJob.status}
                                    class:status-not-saved={currentJobStatusHasChanged}>
                                    on:change={handleStatusChange}>
                                {#each statuses as status}
                                    <option value={status}>{status}</option>
                                {/each}
                            </select>
                            {#if currentJobStatusHasChanged}
                                <label class:status-not-saved-label={currentJobStatusHasChanged}>(Press Enter to save, Escape to cancel)</label>
                            {/if}
                        </td>
                    </tr>
                </table>
                <hr>
                {@html currentJob.post_html}
            {/if}
        </div>
    </div>
</div>
