import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './config/db.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parser
app.use(express.json());

// Connect to database (do not start listening here)
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connection failed:', err);
    process.exit(1);
  }
})();

// Routes
import routes from './routes/index.js';
app.use('/api', routes);

export default app;
