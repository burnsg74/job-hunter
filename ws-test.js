import { io } from 'socket.io-client'
const socket = io(`http://localhost:3092`, {
    withCredentials: true
});

// Listen for the 'eventFromServer' event and log it
socket.on('messageFromServer', (data) => {
    console.log(data);
});

socket.emit('messageFromClient','Hello Greg');

socket.on('messageFromServer', (data) => {
    console.log('messageFromServer', data);
});