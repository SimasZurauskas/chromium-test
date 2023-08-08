import { findIndex } from 'lodash';
import { MProject } from '../../models/projectModel';
import { calcValueOfPercentage, getFinishDate } from '../misc';
import { unassignProjectDirba, assignProjectDirba } from './assign';
import { generatePremija } from './generatePremija';

type UpdateDirba = (
  a: {
    _id: string;
    user: string;
    ikainis: number;
    progress: number;
    premija: { suma: number; ivykdzius: number };
  }[],
  b: MProject
) => Promise<void>;

export const updateDirba: UpdateDirba = async (dirba, project) => {
  const incommingDirba = dirba.map((el) => el._id).filter((el) => Boolean(el));

  for await (const el of incommingDirba) {
    const existingDirbaIdx = findIndex(project.dirba, (el2) => el2._id.toString() === el.toString());
    const incomingDirbaIdx = findIndex(dirba, (el2) => el2._id.toString() === el.toString());

    if (existingDirbaIdx !== -1 && incomingDirbaIdx !== -1) {
      const existingDirba = project.dirba[existingDirbaIdx];
      const newDirba = dirba[incomingDirbaIdx];

      const eur = calcValueOfPercentage(newDirba.ikainis, newDirba.progress - existingDirba.prevProgress);

      if (existingDirba.user.toString() !== newDirba.user) {
        console.log('SWITCHING USERS');
        await unassignProjectDirba({ userId: existingDirba.user, projId: project._id });
        await assignProjectDirba({ userId: newDirba.user, projId: project._id });
      }

      existingDirba.ikainis = newDirba.ikainis;
      existingDirba.progress = newDirba.progress;
      existingDirba.eur = eur;
      existingDirba.likutis = newDirba.ikainis - calcValueOfPercentage(newDirba.ikainis, newDirba.progress);
      existingDirba.finishDate = getFinishDate({
        existingDate: existingDirba.finishDate,
        progress: newDirba.progress
      });
      existingDirba.premija = generatePremija({
        pabaiga: project.pabaiga,
        progress: newDirba.progress,
        existing: existingDirba.premija,
        incoming: newDirba.premija
      });

      existingDirba.user = newDirba.user;
    }
  }
};
