// Root-level app entry that re-exports the implementation in src/
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './src/config/db.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json());

// Connect to the DB
(async () => {
	try {
		await connectDB();
	} catch (err) {
		console.error('DB connection failed:', err);
		process.exit(1);
	}
})();

// Routes
import routes from './src/routes/index.js';
app.use('/api', routes);

export default app;
