import express from 'express';
import upload from '../config/multer';
import {
  getProjectsAdmin,
  adminDeleteProject,
  getProjectAdmin,
  createProjectAdmin,
  updateProjectAdmin,
  adminDeleteAllFotos,
  deleteEngAktuotaComment,
  deleteApskaitaComment,
  getLatestProjectId
} from '../controllers/adminProjectController';
import { getProjectsEng, getProjectEng, updateProjectEng } from '../controllers/engineerProjectController';
import { getProject, getProjectsMy, updateProjectOffice } from '../controllers/officeProjectController';
import {
  getAttachments,
  getPastabos,
  getProjectsCommon,
  sendPastaba,
  uploadAttachment,
  uploadAttachmentEng,
  getAttachmentsEng,
  deleteComment
} from '../controllers/sharedProjectController';
import { admin, protect } from '../middleware';

const router = express.Router();

// ADMIN
router.post('/admin', protect, admin, createProjectAdmin);
router.get('/admin', protect, admin, getProjectsAdmin);
router.get('/admin/latest-id', protect, admin, getLatestProjectId);
router.get('/admin/:projId', protect, admin, getProjectAdmin);
router.put('/admin/:projId', protect, admin, updateProjectAdmin);
router.delete('/admin/:projId', protect, admin, adminDeleteProject);
router.delete('/admin/:projId/fotos', protect, admin, adminDeleteAllFotos);
router.delete('/admin/:projId/eng-aktuota-comment/:commentId', protect, admin, deleteEngAktuotaComment);
router.delete('/admin/:projId/apskaita-comment/:commentId', protect, admin, deleteApskaitaComment);

// OFFICE
router.get('/office', protect, getProjectsMy);
router.get('/office/:projId', protect, getProject);
router.put('/office/:projId', protect, updateProjectOffice);

// ENGINEER
router.get('/engineer', protect, getProjectsEng);
router.get('/engineer/:projId', protect, getProjectEng);
router.put('/engineer/:projId', protect, updateProjectEng);

// SHARED
router.get('/shared/common', protect, getProjectsCommon);
router.get('/shared/:projId/attachment', protect, getAttachments);
router.get('/shared/:projId/pastaba', protect, getPastabos);
router.get('/shared/:projId/attachment-eng/:dalisId/:category', protect, getAttachmentsEng);
router.post('/shared/:projId/attachment', protect, upload.array('files'), uploadAttachment);
router.post('/shared/:projId/attachment-eng', protect, upload.array('files'), uploadAttachmentEng);
router.post('/shared/:projId/pastaba', protect, sendPastaba);
router.delete('/shared/:projId/comment/:commentId', protect, deleteComment);

export { router as projectRoutes };
