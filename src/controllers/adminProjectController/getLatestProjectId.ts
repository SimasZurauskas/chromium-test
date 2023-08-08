import asynchandler from 'express-async-handler';
import Project from '../../models/projectModel';
import { customError } from '../../util/customError';

// @route GET /api/project/admin/latest-id
// @access Private Admin
export const getLatestProjectId = asynchandler(async (req, res) => {
  try {
    const latestProject = await Project.findOne().sort({ createdAt: -1 });
    res.status(200).json({
      data: latestProject?.projektoNr || null
    });
  } catch (error: any) {
    res.status(500);
    throw customError(error);
  }
});
