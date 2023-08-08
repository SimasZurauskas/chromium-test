import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import Project from '../../models/projectModel';

// @route PUT /api/stats/admin/patvirtinta/project/:projId
// @access Protected Admin
export const submitPatvirtinta = expressAsyncHandler(async (req, res) => {
  const projId = req.params.projId;
  const isPatvirtinta = req.body.isPatvirtinta;

  try {
    const project = await Project.findById(projId);

    if (!project || !project.atsakingas.user) {
      res.status(404);
      throw new Error('Project not found');
    }

    if (isPatvirtinta) {
      project.atsakingas.patvirtinta = moment(new Date()).toISOString();
    } else {
      project.atsakingas.patvirtinta = undefined;
    }

    await project.save();
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
