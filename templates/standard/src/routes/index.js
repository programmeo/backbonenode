import { Router } from 'express';
const router = Router();

import authRoutes from './authRoutes.js';

router.get('/', (req, res) => {
  res.json({ message: 'API is working' });
});

// Mount auth routes
router.use('/auth', authRoutes);

export default router;
