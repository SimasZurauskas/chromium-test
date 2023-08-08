import moment from 'moment';
import { MProject } from '../../models/projectModel';
import { calcValueOfPercentage, getFinishDate } from '../misc';
import { assignProjectDirba, assignProjectEngineer } from './assign';

type AddDirba = (
  a: {
    _id: string;
    user: string;
    ikainis: number;
    progress: number;
    premija?: { suma: number; ivykdzius: number };
  }[],
  b: MProject
) => Promise<void>;

export const addDirba: AddDirba = async (dirba, project) => {
  const newDirba = dirba.filter((el) => !Boolean(el._id));

  for await (const el of newDirba) {
    const eur = calcValueOfPercentage(el.ikainis, el.progress);

    project.dirba.push({
      ...el,
      startDate: moment(new Date()).toISOString(),
      prevProgress: 0,
      eur,
      likutis: el.ikainis - eur,
      finishDate: getFinishDate({ existingDate: undefined, progress: el.progress }),
      premija: {
        suma: el.premija?.suma || 0,
        ivykdzius: el.premija?.ivykdzius || 0,
        isEligible: false,
        isPaid: false
      }
    });

    await assignProjectDirba({ userId: el.user, projId: project._id });
  }
};
