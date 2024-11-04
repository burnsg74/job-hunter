<script>
    import { onMount } from "svelte";
    import Editor from "@tinymce/tinymce-svelte";
    // import { io } from "socket.io-client";
    // import { PUBLIC_WS_PORT } from "$env/static/public";

    // let socket;
    // let serverResponse = [];

    let conf = {
        height: 500,
        menubar: false,
        plugins: [
            "advlist",
            "autolink",
            "lists",
            "link",
            "image",
            "charmap",
            "anchor",
            "searchreplace",
            "visualblocks",
            "code",
            "fullscreen",
            "insertdatetime",
            "media",
            "table",
            "preview",
            "help",
            "wordcount",
        ],
        toolbar:
            "undo redo | blocks | " +
            "bold italic forecolor | alignleft aligncenter " +
            "alignright alignjustify | bullist numlist outdent indent | " +
            "removeformat | help",
    };

    let jobs = [];
    let status = "New";
    let currentJob = null;
    let editing = false;
    let autoSaveTimeout;
    const statuses = [
        "New",
        "Saved",
        "Applied",
        "Interview",
        "Rejected",
        "Deleted",
    ];
    let currentJobStatusHasChanged = false;

    $: {
        const params = new URLSearchParams(window.location.search);
        status = params.get("status") ?? "New";
    }

    // function pullJobs() {
    //     socket.emit("messageFromClient", "pull jobs");
    // }

    async function fetchJobs() {
        console.log("Fetching jobs...", status);
        try {
            let response = await fetch("/api/jobs");
            jobs = await response.json();
            if (jobs.length > 0) {
                currentJob = jobs[0]; // Set using regular variable assignment
            }
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    }

    function handleStatusChange(event) {
        const selectedStatus = event.target.value;
        saveStatus(selectedStatus);
    }

    async function saveStatus(newStatus) {
        currentJob.status = newStatus;

        jobs = jobs.map((job) =>
            job.jk === currentJob.jk ? { ...job, status: newStatus } : job,
        );

        try {
            const response = await fetch("/api/jobs", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentJob),
            });

            if (!response.ok) {
                throw new Error("Failed to update status");
            }

            currentJob.status = newStatus;

            // Navigate to the next job with the same status
            let index = jobs.findIndex((j) => j.jk === currentJob.jk);
            let nextJob = jobs
                .slice(index + 1)
                .find((job) => job.status === status);
            currentJob = nextJob ?? null;
        } catch (error) {
            console.error("Error updating status:", error);
        }
    }

    async function autoSave() {
        if (!editing) return;
        // Update the current job's HTML content
        // currentJob.post_html = value;

        try {
            await fetch("/api/jobs", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(currentJob),
            });
            console.log("Auto-saved successfully");
        } catch (error) {
            console.error("Error auto-saving:", error);
        }
    }

    function startAutoSaveTimer() {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(autoSave, 3000);
    }

    function save() {
        autoSave().then(() => {
            editing = false;
        });
    }

    function handleKeyDown(event) {
        console.log("Key pressed:", event.key);

        if (event.key === "e") {
            console.log("Editing...");
            editing = true;
        }

        // console.log(`Key pressed: ${event.key}, Code: ${event.code}`);
        if (event.key === "j" || event.key === "ArrowDown") {
            event.preventDefault();
            let index = jobs.findIndex((j) => j.jk === currentJob.jk);
            if (index !== -1) {
                for (let i = index + 1; i < jobs.length; i++) {
                    if (jobs[i].status === status) {
                        currentJob = jobs[i];
                        //turndown currentJob.post_html

                        let turndownService = new TurndownService();

                        if (currentJob && currentJob.post_html) {
                            let markdown = turndownService.turndown(
                                currentJob.post_html,
                            );
                            console.log(markdown);
                            // let res = askAI(markdown,'Generate a markdown table of the required tech stack and if given the number of years for each')
                            // console.log(res);
                        }
                        break;
                    }
                }
            }
        }
        if (event.key === "k" || event.key === "ArrowUp") {
            event.preventDefault();
            let index = jobs.findIndex((j) => j.jk === currentJob.jk);
            if (index !== -1) {
                for (let i = index - 1; i >= 0; i--) {
                    if (jobs[i].status === status) {
                        currentJob = jobs[i];
                        break;
                    }
                }
            }
        }

        if (event.key === "l" || event.key === "ArrowLeft") {
            event.preventDefault();
            currentJobStatusHasChanged = true;
            let currentIndex = statuses.indexOf(currentJob.status);
            let nextIndex = currentIndex + 1;
            if (nextIndex >= statuses.length) nextIndex = 0;
            currentJob.status = statuses[nextIndex];
        }

        if (event.key === "h" || event.key === "ArrowRight") {
            event.preventDefault();
            currentJobStatusHasChanged = true;
            let currentIndex = statuses.indexOf(currentJob.status);
            let nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = statuses.length - 1;
            currentJob.status = statuses[nextIndex];
        }

        if (event.key === "n") {
            saveStatus("New");
        } else if (event.key === "s") {
            saveStatus("Saved");
        } else if (event.key === "a") {
            saveStatus("Applied");
        } else if (event.key === "i") {
            saveStatus("Interview");
        } else if (event.key === "r") {
            saveStatus("Rejected");
        } else if (event.key === "d") {
            saveStatus("Deleted");
        }

        if (event.key === "Tab") {
            event.preventDefault(); // Prevent default tab behavior
            let currentIndex = statuses.indexOf(status);
            if (currentIndex === -1) currentIndex = 0;
            let nextIndex = (currentIndex + 1) % statuses.length; // Move to the next index, wrap around to 0 if at end
            updateStatus(statuses[nextIndex]);
        }

        if (event.key === "Enter") {
            event.preventDefault();
            saveStatus(currentJob.status);
            currentJobStatusHasChanged = false;
        }

        if (event.key === "Escape") {
            event.preventDefault();
            currentJob.status = status;
            currentJobStatusHasChanged = false;
        }
    }

    function updateStatus(newStatus) {
        status = newStatus;
        currentJob = jobs.find((job) => job.status === status);
    }

    onMount(() => {
        fetchJobs();
        startAutoSaveTimer;
        document.addEventListener("keydown", handleKeyDown);

        // socket = io(`http://localhost:${PUBLIC_WS_PORT}`, {
        //     withCredentials: true,
        // });

        // // Listen for the 'messageFromServer' event and update the UI
        // socket.on("messageFromServer", (data) => {
        //     console.log("messageFromServer", data);
        //     serverResponse = [...serverResponse, data];
        // });

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    });

    function escapeRegExp(string) {
        // return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return string.replace(/[.*+?^${}()|[\]#\\]/g, "\\$&");
    }

    function highlightWords(text) {
        if (!text) return "";
        const wordsToHighlightGreen = [
            "HTML",
            "JavaScript",
            "CSS",
            "NoSQL",
            "SQL",
            "React",
            "Vue",
            "Node.js",
            "Node",
            "Python",
            "PHP",
            "Git",
            "AWS",
            "TypeScript",
            "Svelte",
            "Flutter",
            "Django",
            "Laravel",
            "jQuery",
        ].map(escapeRegExp);

        const wordsToHighlightRed = [
            "Ruby",
            "Azure",
            ".Net",
            "Java",
            "C#",
            "C++",
            "Swift",
            "Kotlin",
            "Angular",
            "Flutter",
            "Spring",
            "MSSQL",
        ].map(escapeRegExp);

        const regex = new RegExp(
            `\\b(${wordsToHighlightGreen.join("|")})\\b|\\b(${wordsToHighlightRed.join("|")})\\b`,
            "g",
        );

        return text.replace(regex, (match, p1, p2) => {
            if (p1) {
                return `<span class="highlight-green">${match}</span>`;
            } else if (p2) {
                return `<span class="highlight-red">${match}</span>`;
            }
            return match;
        });
    }

    $: highlightedHtml = highlightWords(currentJob?.post_html);
</script>

<div class="container-fluid">
    <!--        <div class="row border-bottom">-->
    <!--            {#each statuses as statusGroup}-->
    <!--                <div class="col-2 status-nav {statusGroup} {statusGroup === status ? 'active-group' : ''}"-->
    <!--                     on:click={() => updateStatus(statusGroup)}>-->
    <!--                    {statusGroup} ({jobs.filter(job => job.status === statusGroup).length})-->
    <!--                </div>-->
    <!--            {/each}-->
    <!--        </div>-->
    <div class="row">
        <div class="col-3 jobs-left-col">
            <!-- <ul>
                {#each serverResponse as item}
                    <li>{item}</li>
                {/each}
            </ul> -->
            {#each jobs.filter((job) => job.status === status) as job}
                <div
                    role="button"
                    tabindex="0"
                    class="job-title {job.jk === currentJob?.jk
                        ? 'active'
                        : 'inactive'}"
                    on:click={() => (currentJob = job)}
                    on:keydown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            currentJob = job;
                        }
                    }}
                >
                    <strong>{job.company}</strong> -
                    {job.title}
                </div>
            {/each}
            <!--            <button on:click={pullJobs}>Pull jobs</button>-->
            {#if jobs.filter((job) => job.status === status).length === 0}
                <p class="empty">
                    No {status.toLowerCase()} job listings found.
                </p>
            {/if}
        </div>
        <div class="col-9 jobs-right-col">
            <div class="row border-bottom">
                {#each statuses as statusGroup}
                    <div
                        role="button"
                        tabindex="0"
                        class="col-2 status-nav {statusGroup} {statusGroup ===
                        status
                            ? 'active-group'
                            : ''}"
                        on:click={() => updateStatus(statusGroup)}
                        on:keydown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                                updateStatus(statusGroup);
                            }
                        }}
                    >
                        {statusGroup} ({jobs.filter(
                            (job) => job.status === statusGroup,
                        ).length})
                    </div>
                {/each}
            </div>
            {#if currentJob}
                <h1>
                    {currentJob.title} &nbsp;
                    <a href={currentJob.link} target="_blank">
                        <i class="bi bi-arrow-up-right-square small-icon"
                        ></i></a
                    >
                </h1>

                <table>
                    <tr>
                        <td>Company:</td>
                        <td>
                            <strong>
                                {currentJob.company}
                                <a
                                    href={currentJob.company_link}
                                    target="_blank"
                                >
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
                            <select
                                bind:value={currentJob.status}
                                class:status-not-saved={currentJobStatusHasChanged}
                            >
                                on:change={handleStatusChange}>
                                {#each statuses as status}
                                    <option value={status}>{status}</option>
                                {/each}
                            </select>
                            {#if currentJobStatusHasChanged}
                                <span
                                    class:status-not-saved-label={currentJobStatusHasChanged}
                                >
                                    (Press Enter to save, Escape to cancel)
                                </span>
                            {/if}
                        </td>
                    </tr>
                </table>
                <hr />
                {#if editing}
                    <button class="save-button" on:click={save}>Save</button>
                    <Editor
                        licenseKey="gpl"
                        scriptSrc="tinymce/tinymce.min.js"
                        height="100%"
                        bind:value={currentJob.post_html}
                        {conf}
                    />
                {:else}
                    <!--{@html currentJob.post_html}-->
                    {@html highlightedHtml}
                {/if}
            {/if}
        </div>
    </div>
</div>

<style>
    .save-button {
        padding: 0 12px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px 5px 0 0;
        cursor: pointer;
        margin-left: 15px;
    }

    .save-button:hover {
        background-color: #0056b3;
    }

    .highlight {
        background-color: yellow;
    }
</style>
