import express from 'express';
import { protect } from '../middleware';
import { signIn, refreshToken, getAuthUser } from '../controllers/authController';

const router = express.Router();

router.post('/signin', signIn);
router.get('/user', protect, getAuthUser);
router.get('/refresh-token', protect, refreshToken);

export { router as authRoutes };
