import express from 'express';
import cors from 'cors';
import {createServer} from 'http';
import {Server} from 'socket.io';
import {handler} from './build/handler.js';
import dotenv from 'dotenv';
import { exec } from 'child_process';

if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
const origin = process.env.ORIGIN
const port = process.env.WS_PORT;

const app = express();
const server = createServer(app);
const corsOptions = {
    origin: origin, methods: ['GET', 'POST'], allowedHeaders: ['Content-Type'], credentials: true
};

app.use(cors(corsOptions));

const io = new Server(server, {
    cors: {
        origin: origin, methods: ['GET', 'POST'], credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // pullJobsLog
    socket.on('pullJobsLog', (data) => {
        console.log('pullJobsLog:', data);
        io.emit('pullJobsUpdate', data);
    })

    socket.on('messageFromClient', (data) => {
        console.log('Received message from client:', data);

        if (data === 'pull jobs') {
            io.emit('pullJobsUpdate', 'Warming up Chrome...');
            exec('pnpm exec playwright test --project=chromium', (error, stdout, stderr) => {
                if (error) {
                    io.emit('pullJobsUpdate', `Error ${error.message}`);
                    console.error(`Error: ${error.message}`);
                    return;
                }
                if (stderr) {
                    io.emit('pullJobsUpdate', `Error ${stderr}`);
                    console.error(`Stderr: ${stderr}`);
                    return;
                }
                console.log(`Stdout: ${stdout}`);
            });
        }
    });
    socket.emit('eventFromServer', 'WS Connected');
});

// SvelteKit should handle everything else using Express middleware
// https://github.com/sveltejs/kit/tree/master/packages/adapter-node#custom-server
app.use(handler);

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});