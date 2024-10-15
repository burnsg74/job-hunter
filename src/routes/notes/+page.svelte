<script>
    import {onMount} from "svelte";
    import Editor from '@tinymce/tinymce-svelte';

    let conf = {
        height: 500,
        menubar: false,
        plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'preview', 'help', 'wordcount'
        ],
        toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
    }

    let notes = [];
    let currentNote = null;
    let editing = false;
    let autoSaveTimeout;


    async function fetchNotes() {
        console.log('Fetching notes...');
        try {
            let response = await fetch('/api/notes');
            notes = await response.json();
            console.log('Notes:', notes);
            if (notes.length > 0) {
                currentNote = notes[0];
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    }

    async function autoSave() {
        if (!editing) return;
        try {
            const response = await fetch('/api/notes', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(currentNote),
            });
            if (response.ok) {
                const updatedNote = await response.json();
                console.log('Auto-saved successfully');
                notes = notes.map(note =>
                    note.id === updatedNote.id ? updatedNote : note
                );
            } else {
                console.error('Error auto-saving:', await response.text());
            }
        } catch (error) {
            console.error('Error auto-saving:', error);
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
        if (editing) return;
        event.preventDefault();
        console.log('Key pressed:', event.key);

        if (event.key === 'e') {
            console.log('Editing...');
            editing = true;
        }
    }

    async function createNewNote() {
        const newNote = {
            title: 'New Note',
            note: ''
        };

        try {
            const response = await fetch('/api/notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newNote),
            });

            if (response.ok) {
                const createdNote = await response.json();
                notes = [createdNote, ...notes];
                currentNote = createdNote;
                editing = true;
            } else {
                console.error('Failed to create new note');
            }
        } catch (error) {
            console.error('Error creating new note:', error);
        }
    }

    onMount(() => {
        fetchNotes();
        startAutoSaveTimer
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }
    });
</script>
<div class="container-fluid">
    <div class="row">
        <div class="col-2 notes-left-col vh-100">
            <nav class="row navbar bg-body-tertiary">
                <a href="/" class="col-6 nav-link jobs-link">
                    <button class="nav-btn btn btn-sm btn-outline-success" type="button">Jobs</button>
                </a>
                <a href="/notes" class="col-6 nav-link">
                    <button class="active nav-btn btn btn-sm btn-outline-secondary" type="button">Notes</button>
                </a>
            </nav>
            <div class="row">

                <button href="#" class="new-note-link w-100" on:click|preventDefault={createNewNote}>
                    <i class="bi bi-plus" style="color: green;"></i> New Note
                </button>
            </div>
            {#each notes as note}
                <div class="note-title {note.id === currentNote?.id ? 'active' : 'inactive'}"
                     on:click={() => currentNote = note}>
                    {note.title}
                </div>
            {/each}
            {#if notes.length === 0}
                <p class="empty">No note listings found.</p>
            {/if}
        </div>
        <div class="col-10 notes-right-col">
            {#if currentNote}
                {#if editing}
                    <input
                            type="text"
                            bind:value={currentNote.title}
                    />
                {:else}
                    <h1>{currentNote.title}</h1>
                {/if}

                {#if editing}
                    <button class="save-button" on:click={save}>Save</button>
                    <Editor
                            licenseKey='gpl'
                            scriptSrc='tinymce/tinymce.min.js'
                            bind:value={currentNote.note}
                            {conf}
                    />
                {:else}
                    {@html currentNote.note}
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
</style>