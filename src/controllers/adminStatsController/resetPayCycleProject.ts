import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import Project from '../../models/projectModel';
import User, { MUser } from '../../models/userModel';
import { calcValueOfPercentage } from '../../util/misc';

const ADD_DAYS = 0;

// @route PUT /api/stats/admin/reset/project/:projId
// @access Protected Admin
export const resetPayCycleProject = expressAsyncHandler(async (req, res) => {
  const projId = req.params.projId;

  const project = await Project.findById(projId);

  if (!project || !project.atsakingas.user) {
    res.status(404);
    throw new Error('Project not found');
  }

  // ATSAKINGAS
  const userAtsakingas = (await User.findById(project.atsakingas.user)) as MUser;

  const suma = calcValueOfPercentage(
    project.atsakingas.ikainis || 0,
    project.atsakingas.progress - project.atsakingas.prevProgress
  );

  if (suma || (project.atsakingas.premija?.isEligible && !project.atsakingas.premija.isPaid)) {
    let premija = 0;
    if (project.atsakingas.premija?.isEligible && !project.atsakingas.premija.isPaid) {
      project.atsakingas.premija.isPaid = true;
      project.atsakingas.premija.achievedDate = moment(new Date()).add(ADD_DAYS, 'days').toISOString();
      premija = project.atsakingas.premija.suma;
    }

    userAtsakingas.payments.atsakingas.push({
      project: projId,
      date: moment(project.atsakingas.patvirtinta).add(ADD_DAYS, 'days').toISOString(),
      dateId: moment(project.atsakingas.patvirtinta).add(ADD_DAYS, 'days').format('YYYY-MM'),
      ikainis: project.atsakingas.ikainis || 0,
      progress: project.atsakingas.progress,
      prevProgress: project.atsakingas.prevProgress,
      suma,
      premija
    });

    await userAtsakingas.save();
  }

  project.timeline.push({
    date: moment(new Date()).add(ADD_DAYS, 'days').toISOString(),
    dateId: moment(new Date()).add(ADD_DAYS, 'days').format('YYYY-MM'),
    baigtumas: project.atsakingas.progress,
    prevBaigtumas: project.atsakingas.prevProgress
  });

  // DIRBA
  for await (const el of project.dirba) {
    const userDirba = (await User.findById(el.user)) as MUser;

    const suma = calcValueOfPercentage(el.ikainis, el.progress - el.prevProgress);

    if (suma || (el.premija?.isEligible && !el.premija.isPaid)) {
      let premija = 0;
      if (el.premija?.isEligible && !el.premija.isPaid) {
        el.premija.isPaid = true;
        el.premija.achievedDate = moment(project.atsakingas.premija?.achievedDate).add(ADD_DAYS, 'days').toISOString();
        premija = el.premija.suma;
      }

      userDirba.payments.dirba.push({
        project: projId,
        date: moment(project.atsakingas.patvirtinta).add(ADD_DAYS, 'days').toISOString(),
        dateId: moment(project.atsakingas.patvirtinta).add(ADD_DAYS, 'days').format('YYYY-MM'),
        ikainis: el.ikainis,
        progress: el.progress,
        prevProgress: el.prevProgress,
        suma,
        premija
      });

      await userDirba.save();
    }

    el.prevProgress = el.progress;
    el.eur = 0;
    el.likutis = calcValueOfPercentage(el.ikainis, 100 - el.prevProgress);
  }

  project.atsakingas.prevProgress = project.atsakingas.progress;
  project.atsakingas.pateikta = '';
  project.atsakingas.patvirtinta = '';
  project.atsakingas.eur = 0;
  project.atsakingas.likutis = calcValueOfPercentage(
    project.atsakingas.ikainis || 0,
    100 - project.atsakingas.prevProgress
  );

  await project.save();

  res.sendStatus(204);
});
