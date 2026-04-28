import { Router } from 'express';
import { getHealthStatus } from '../controllers/health.controller.js';
const router = Router();

// This might be replaced/appended during generation if auth is selected
// import authRoutes from './authRoutes.js';

router.get('/health', getHealthStatus);

// Mount auth routes if generated
// router.use('/auth', authRoutes);

export default router;
