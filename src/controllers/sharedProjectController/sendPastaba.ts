import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import Project from '../../models/projectModel';

// @route POST /api/project/shared/:projId/pastaba
// @access Private
export const sendPastaba = expressAsyncHandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId as string;
  const projId = req.params.projId;

  const pastaba = {
    comment: req.body.text,
    user: userId,
    date: moment(new Date()).toISOString()
  };

  const project = await Project.findById(projId);

  if (!project) {
    res.status(400);
    throw new Error('Bad request');
  }

  project.pastabos.push(pastaba);

  await project.save();

  res.sendStatus(201);
});
