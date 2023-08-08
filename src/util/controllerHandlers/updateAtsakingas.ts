import { findIndex } from 'lodash';
import moment from 'moment';
import { MProject } from '../../models/projectModel';
import { calcValueOfPercentage, getFinishDate } from '../misc';
import { unassignProjectDirba, assignProjectDirba, assignProjectAtsakingas, unassignProjectAtsakingas } from './assign';
import { generatePremija } from './generatePremija';

type UpdateAtsakingas = (
  a: {
    user: string;
    ikainis: number;
    pateikta?: string;
    patvirtinta?: string;
    premija: { suma: number; ivykdzius: number };
  },
  b: MProject,
  c: number
) => Promise<void>;

export const updateAtsakingas: UpdateAtsakingas = async (incomingAtsakingas, project, totalBaigtumas) => {
  if (project.atsakingas.user?.toString() === incomingAtsakingas.user) {
    const eur = calcValueOfPercentage(incomingAtsakingas.ikainis, totalBaigtumas - project.atsakingas.prevProgress);
    project.atsakingas = {
      ...project.atsakingas,
      ...incomingAtsakingas,
      progress: totalBaigtumas,
      eur,
      likutis: incomingAtsakingas.ikainis - calcValueOfPercentage(incomingAtsakingas.ikainis, totalBaigtumas),
      finishDate: getFinishDate({ existingDate: project.atsakingas.finishDate, progress: totalBaigtumas }),
      premija: generatePremija({
        pabaiga: project.pabaiga,
        progress: totalBaigtumas,
        existing: project.atsakingas.premija,
        incoming: incomingAtsakingas.premija
      })
    };
  } else {
    console.log('SWITCHING ATSAKINGAS');
    await assignProjectAtsakingas({ userId: incomingAtsakingas.user as string, projId: project._id });
    await unassignProjectAtsakingas({ userId: project.atsakingas?.user as string, projId: project._id });

    const eur = calcValueOfPercentage(incomingAtsakingas.ikainis, totalBaigtumas);
    const likutis = incomingAtsakingas.ikainis - eur;

    project.atsakingas = {
      ...incomingAtsakingas,
      startDate: moment(new Date()).toISOString(),
      prevProgress: 0,
      progress: totalBaigtumas,
      eur,
      likutis,
      finishDate: getFinishDate({ existingDate: project.atsakingas.finishDate, progress: totalBaigtumas }),
      premija: generatePremija({
        pabaiga: project.pabaiga,
        progress: totalBaigtumas,
        existing: project.atsakingas.premija,
        incoming: incomingAtsakingas.premija
      })
    };
  }
};
