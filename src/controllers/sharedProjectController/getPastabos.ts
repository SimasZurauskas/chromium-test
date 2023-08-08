import asynchandler from 'express-async-handler';
import Project from '../../models/projectModel';

// @route GET /api/project/shared/:projId/pastaba
// @access Private
export const getPastabos = asynchandler(async (req, res) => {
  const projId = req.params.projId;

  const project = await Project.findById(projId).lean().populate('pastabos.user', 'userName');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({ data: project.pastabos });
});
