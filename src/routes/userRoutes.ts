import express from 'express';
import { createUser, getUsers, getUser, updateUser, deleteUser } from '../controllers/adminUserController';
import { officeGetUser, officeUpdateUser } from '../controllers/officeUserController';
import { admin, protect } from '../middleware';

const router = express.Router();

router.post('/admin', protect, admin, createUser);
router.get('/admin/:id', protect, admin, getUser);
router.put('/admin/:id', protect, admin, updateUser);
router.delete('/admin/:id', protect, admin, deleteUser);
router.get('/admin', protect, admin, getUsers);

router.get('/office/:id', protect, officeGetUser);
router.put('/office', protect, officeUpdateUser);
router.put('/office', protect, officeUpdateUser);

export { router as userRoutes };
