<script>
    import { onMount } from 'svelte';

    let currentActive = '/';

    onMount(() => {
        // Get the current path from the window location
        currentActive = window.location.pathname;
    });

    function setActive(event) {
        currentActive = event.target.getAttribute('href');
    }
</script>

<nav class="navbar navbar-expand-sm fixed-top border-bottom border-bottom-dark bg-light" style="padding: 0">
    <div class="container-fluid">
        <div class="collapse navbar-collapse" id="navbarCollapse">
            <ul class="navbar-nav me-auto mb-2 mb-md-0">
                <li class="nav-item">
                    <a
                            class="nav-link {currentActive === '/' ? 'active' : ''}"
                            aria-current="page"
                            href="/"
                            on:click={setActive}
                    >Jobs</a>
                </li>
<!--                <li class="nav-item">-->
<!--                    <a-->
<!--                            class="nav-link {currentActive === '/notes' ? 'active' : ''}"-->
<!--                            aria-current="page"-->
<!--                            href="/notes"-->
<!--                            on:click={setActive}-->
<!--                    >Notes</a>-->
<!--                </li>-->
<!--                <li class="nav-item">-->
<!--                    <a-->
<!--                            class="nav-link {currentActive === '/calendar' ? 'active' : ''}"-->
<!--                            aria-current="page"-->
<!--                            href="/calendar"-->
<!--                            on:click={setActive}-->
<!--                    >Calendar</a>-->
<!--                </li>-->
            </ul>
        </div>
    </div>
</nav>

<style>
    .nav-link.active {
        font-weight: bold;
        color: darkblue;
    }
</style>