<script>
    import 'bootstrap/dist/js/bootstrap.bundle.min.js';
    import '$lib/app.css';
</script>

<main>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
<!--        <a class="navbar-brand" href="#">Navbar</a>-->
<!--        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">-->
<!--            <span class="navbar-toggler-icon"></span>-->
<!--        </button>-->
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="/">Jobs</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/notes">Notes</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="/pull-jobs">Pull Jobs</a>
                </li>
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Job Boards
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        <li><a class="dropdown-item" href="https://www.indeed.com/" target="_blank">Indeed</a></li>
                        <li><a class="dropdown-item" href="https://www.linkedin.com/feed/" target="_blank">LinkedIn</a></li>
                        <li><a class="dropdown-item" href="https://larajobs.com/" target="_blank">Laravel job</a></li>
                        <li><a class="dropdown-item" href="https://www.simplyhired.com/search?q=Full+Stack+Engineer&l=Remote" target="_blank">SimplyHired</a></li>
                        <li><a class="dropdown-item" href="https://www.upwork.com/" target="_blank">Upwork</a></li>
                        <li><a class="dropdown-item" href="https://www.dice.com/dashboard/jobs" target="_blank">Dice</a></li>
                    </ul>
                </li>
            </ul>
        </div>
    </nav>
    <slot/>
</main>
