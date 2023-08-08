import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import Project from '../../models/projectModel';

// @route PUT /api/stats/admin/premija/:projId/:userId
// @access Protected Admin
export const managePremija = expressAsyncHandler(async (req, res) => {
  const projId = req.params.projId;
  const userId = req.params.userId;
  const isEligible = req.body.isEligible as boolean;
  const userType = req.body.userType as 'dirba' | 'atsakingas';

  const project = await Project.findById(projId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (userType === 'atsakingas') {
    if (isEligible) {
      // @ts-ignore
      project.atsakingas.premija = {
        ...project.atsakingas.premija,
        isEligible: true,
        achievedDate: moment(new Date()).toISOString()
      };
    } else {
      // @ts-ignore
      project.atsakingas.premija = { ...project.atsakingas.premija, isEligible: false, achievedDate: undefined };
    }
  }

  if (userType === 'dirba') {
    const user = project.dirba.find((el) => el.user.toString() === userId);

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    if (isEligible) {
      // @ts-ignore
      user.premija = { ...user.premija, isEligible: true, achievedDate: moment(new Date()).toISOString() };
    } else {
      // @ts-ignore
      user.premija = { ...user.premija, isEligible: false, achievedDate: undefined };
    }

    // @ts-ignore
    user.premija?.isEligible = isEligible;
  }

  await project.save();

  res.sendStatus(204);
});
