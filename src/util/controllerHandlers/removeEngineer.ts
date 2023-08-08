import { findIndex } from 'lodash';
import { MProject } from '../../models/projectModel';
import { unAssignProjectEngineer } from './assign';

type RemoveEngineer = (
  a: {
    _id: string;
    user: string;
  }[],
  b: MProject
) => Promise<void>;

export const removeEngineer: RemoveEngineer = async (dalys, project) => {
  const incommingDalys = dalys.map((el) => el._id);

  const tobeRemovedDalys = project.dalys.filter((el) => !incommingDalys.includes(el._id.toString()));

  for await (const el of tobeRemovedDalys) {
    const dalisIdx = findIndex(project.dalys, (dalis) => dalis._id === el._id);

    project.dalys.splice(dalisIdx, 1);
    await unAssignProjectEngineer(el.dalis, { userId: el.user, projId: project._id });
  }
};
