import {writable} from 'svelte/store';

export const jobs = writable( {'new': [], 'saved': [], 'applied': [], 'interviewing': [], 'archived': []});