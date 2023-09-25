<script>
        import 'bootstrap/dist/js/bootstrap.bundle.js'
        import 'bootstrap/dist/css/bootstrap.min.css'
        import 'bootstrap/dist/css/bootstrap-utilities.min.css'
        import 'bootstrap-icons/font/bootstrap-icons.min.css'
        import "../app.css";
        import {onMount} from "svelte";
        import {jobs} from "$lib/store.js"
        import Database from "tauri-plugin-sql-api";

        onMount(async () => {
                Database.load("sqlite:job-hunter.sqlite").then((db) => {
                        db.select("SELECT * FROM indeed_jobs").then((result) => {
                                let grouped = result.reduce((result, obj) => {
                                        const key = obj.status;
                                        if (!result[key]) {
                                                result[key] = [];
                                        }
                                        result[key].push(obj);
                                        return result;
                                }, {});

                                grouped["new"] = grouped["new"] || [];
                                grouped["saved"] = grouped["saved"] || [];
                                grouped["applied"] = grouped["applied"] || [];
                                grouped["interviewing"] = grouped["interviewing"] || [];
                                grouped["archived"] = grouped["archived"] || [];

                                jobs.set(grouped);
                        });
                });
        });
</script>
<style>

</style>
<main class="container-fluid">
        <slot/>
</main>