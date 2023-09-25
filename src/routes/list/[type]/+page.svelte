<script>
    import "ag-grid-community/styles/ag-grid.css";
    import "ag-grid-community/styles/ag-theme-alpine.css";
    import * as agGrid from "ag-grid-community";
    import {jobs} from "$lib/store.js"
    import {page} from "$app/stores";
    import {goto} from "$app/navigation";
    import {onMount} from "svelte";

    let type = $page.params.type;
    let typeJobs = [];
    let gridOptions;

    onMount(() => {
        console.log(type)
        typeJobs = $jobs[type]
        gridOptions = {
            columnDefs: [
                {headerName: "Title", field: "job_title",resizable: true},
                {headerName: "Subtitle", field: "subtitle", resizable: true},
                {headerName: "Post", field: "posted_at", resizable: true},
                {headerName: "Company", field: "company_name", resizable: true},
                {headerName: "Min", field: "salary_min",resizable: true},
                {headerName: "Max", field: "salary_max",resizable: true},
                {headerName: "U!", field: "urgently_hiring_text",resizable: true},
            ],
            defaultColDef: {sortable: true, filter: true, resizable: true},
            rowData: typeJobs,
            animateRows: true,
            onGridReady: (event) => event.api.sizeColumnsToFit(),
            onRowClicked: function(params) {
                goto(`/details/${type}/${params.data.id}`);
            }
        }
        const eGridDiv = document.getElementById("agGrid");
        new agGrid.Grid(eGridDiv, gridOptions);
    })

</script>

<nav aria-label="breadcrumb" style="margin-left: -10px; margin-right: -10px">
    <ol class="breadcrumb bg-body-secondary ps-3">
        <li class="breadcrumb-item"><a href="/">Home</a></li>
        <li class="breadcrumb-item active">{type}</li>
    </ol>
</nav>
<div class="ag-theme-alpine h-500 h-full">
    <div id="agGrid" class="w-90 p-2 h-full" style="height: 800px"></div>
</div>