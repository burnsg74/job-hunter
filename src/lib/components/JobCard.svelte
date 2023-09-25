<script>
    export let icon;
    export let title;
    export let description;
    export let count;
    export let route;
</script>
<div class="card">
    <div class="card-header">
        <h5 class="card-title"><i class="bi {icon} me-2"></i> {title}<span
                class="float-end">{count ?? 0}</span></h5>
    </div>
    <div class="card-body">
        <p class="card-text">{description}</p>
    </div>
    <div class="card-footer text-body-secondary text-end">
        <a href="/list/{route}" class="btn btn-primary">View</a>
    </div>
</div>