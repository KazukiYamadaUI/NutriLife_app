import { Router } from 'express';
import authRoutes from './auth.routes';
import mealRoutes from './meal.routes';
import userRoutes from './user.routes';
import healthRoutes from './health.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/meals', mealRoutes);
router.use('/user', userRoutes);
router.use('/health', healthRoutes);

export default router;
