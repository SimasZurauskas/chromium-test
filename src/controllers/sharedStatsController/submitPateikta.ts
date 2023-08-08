import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import Project from '../../models/projectModel';

// @route PUT /api/stats/shared/pateikta/project/:projId
// @access Protected
export const submitPateikta = expressAsyncHandler(async (req, res) => {
  const projId = req.params.projId;
  const isPateikta = req.body.isPateikta;

  const project = await Project.findById(projId);

  if (!project || !project.atsakingas.user) {
    res.status(404);
    throw new Error('Project not found');
  }

  try {
    if (isPateikta) {
      project.atsakingas.pateikta = moment(new Date()).toISOString();
    } else {
      project.atsakingas.pateikta = undefined;
    }

    await project.save();
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
