// Root-level app entry that re-exports the implementation in src/
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';
import { connectDB } from './src/config/db.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Performance middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
	standardHeaders: true,
	legacyHeaders: false,
});
app.use(limiter);

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
