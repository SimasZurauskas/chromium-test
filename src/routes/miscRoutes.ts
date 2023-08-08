import express from 'express';
import { protect } from '../middleware';
import { getUsersOptions, getEngineersOptions, getNonAdminOptions } from '../controllers/miscController';

const router = express.Router();

router.get('/options/users', protect, getUsersOptions);
router.get('/options/engineers', protect, getEngineersOptions);
router.get('/options/non-admin', protect, getNonAdminOptions);

export { router as miscRoutes };
