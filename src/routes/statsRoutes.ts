import express from 'express';
import {
  getStatsProjects,
  submitPatvirtinta,
  getStatsUsers,
  resetPayCycleProject,
  resetPayCyclePapildomi,
  managePremija
} from '../controllers/adminStatsController';
import {
  submitPateikta,
  submitPateiktapaPapildomi,
  submitPatvirtintaPapildomi
} from '../controllers/sharedStatsController';
import { admin, protect } from '../middleware';

const router = express.Router();

router.get('/admin/projects', protect, admin, getStatsProjects);
router.get('/admin/users', protect, admin, getStatsUsers);
router.put('/admin/patvirtinta/project/:projId', protect, admin, submitPatvirtinta);
router.put('/admin/reset/project/:projId', protect, admin, resetPayCycleProject);
router.put('/admin/reset/user/:userId', protect, admin, resetPayCyclePapildomi);
router.put('/admin/premija/:projId/:userId', protect, admin, managePremija);

router.put('/shared/pateikta/project/:projId', protect, submitPateikta);
router.put('/shared/papildomi/:userId/pateikta', protect, submitPateiktapaPapildomi);
router.put('/shared/papildomi/:userId/patvirtinta', protect, submitPatvirtintaPapildomi);

export { router as statsRoutes };
