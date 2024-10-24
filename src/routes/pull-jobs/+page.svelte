<script>
    import {onMount} from "svelte";
    import {io} from 'socket.io-client'
    import {PUBLIC_WS_PORT} from '$env/static/public';


    let socket;
    let serverResponse = [];

    onMount(() => {
        socket = io(`http://localhost:${PUBLIC_WS_PORT}`, {
            withCredentials: true
        });
        socket.on('connect', () => {
            console.log('Connected to server');
        });


        socket.emit('messageFromClient', 'pull jobs');
        socket.on('pullJobsUpdate', (data) => {
            console.log('pullJobsUpdate', data);
            serverResponse = [...serverResponse, data];
            // scroll to the bottom of  response-container

            const responseContainer = document.querySelector('.response-container');
            if (responseContainer) {
                responseContainer.scrollTop = responseContainer.scrollHeight;
            }
        });

    });
</script>
<div class="container-fluid">
    <div class="row">
        <a href="/">Back</a>
    </div>
    <h1>Pulling Jobs...</h1>
    <div class="response-container">
        <div>Starting up...</div>
        {#each serverResponse as item}
            <div>{item}</div>
        {/each}
    </div>
</div>

<style>
    /*.full-height {*/
    /*    height: 100vh;*/
    /*    display: flex;*/
    /*    flex-direction: column;*/
    /*}*/

    .container-fluid > .row,
    .container-fluid > h1 {
        flex: 0 0 auto;
    }

    .response-container {
        flex: 1 1 auto;
        overflow-y: auto;
        padding: 20px;
        background: black;
        color: #07ce07;
    }
</style>