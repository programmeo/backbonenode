// Root-level server bootstrap
import 'dotenv/config';
import http from 'http';
import app from './app.js';
import { CONSTANTS } from './src/config/constants.js';

const PORT = CONSTANTS.PORT || 3000;
const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`🚀 Server listening on port ${PORT}`);
});
