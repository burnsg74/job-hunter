import {sveltekit} from '@sveltejs/kit/vite';
import {defineConfig} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {Server} from 'socket.io';

const webSocketServer = {
	name: 'webSocketServer',
	configureServer(server) {
		if (!server.httpServer) return;

		const io = new Server(server.httpServer);
		io.on('connection', (socket) => {
			socket.emit('eventFromServer', 'Hello, World 👋');
		});
	}
};

export default defineConfig({
    plugins: [
		viteStaticCopy({
        targets: [{src: 'node_modules/tinymce/*', dest: 'tinymce'}]
    }),
		sveltekit().then(),
		webSocketServer
	],
	css: {
        devSourcemap: false
    }
});
