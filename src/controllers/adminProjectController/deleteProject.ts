import asynchandler from 'express-async-handler';
import Project from '../../models/projectModel';
import {
  unassignProjectAtsakingas,
  unassignProjectDirba,
  unAssignProjectEngineer
} from '../../util/controllerHandlers';
import { customError } from '../../util/customError';

// @route DELETE /api/project/admin/:projId
// @access Private Admin
export const adminDeleteProject = asynchandler(async (req, res) => {
  const projId = req.params.projId;
  try {
    const project = await Project.findById(projId);

    if (!project) {
      res.status(404);
      throw customError({ message: 'Project not found' });
    }

    await unassignProjectAtsakingas({ userId: project.atsakingas.user as string, projId });

    for await (const el of project.dirba) {
      await unassignProjectDirba({ userId: el.user as string, projId });
    }

    for await (const el of project.dalys) {
      await unAssignProjectEngineer(el.dalis, { userId: el.user as string, projId });
    }

    await Project.findByIdAndDelete(projId);
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw customError(error);
  }
});
