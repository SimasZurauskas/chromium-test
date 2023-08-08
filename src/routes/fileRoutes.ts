import express from 'express';
import { downloadFile, deleteFile, deleteFileEng } from '../controllers/fileController';
import { protect } from '../middleware';

const router = express.Router();

router.get('/:id', protect, downloadFile);
router.delete('/:id', protect, deleteFile);
router.delete('/:id/eng', protect, deleteFileEng);

export { router as fileRoutes };
