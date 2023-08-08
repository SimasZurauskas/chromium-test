import { findIndex } from 'lodash';
import { MProject } from '../../models/projectModel';
import { unassignProjectDirba, unAssignProjectEngineer } from './assign';

type RemoveDirba = (
  a: {
    _id: string;
    user: string;
  }[],
  b: MProject
) => Promise<void>;

export const removeDirba: RemoveDirba = async (dirba, project) => {
  const incommingDirba = dirba.map((el) => el._id);

  const tobeRemovedDirba = project.dirba.filter((el) => !incommingDirba.includes(el._id.toString()));

  for await (const el of tobeRemovedDirba) {
    const dirbaIdx = findIndex(project.dirba, (dirba) => dirba._id === el._id);

    project.dirba.splice(dirbaIdx, 1);
    await unassignProjectDirba({ userId: el.user, projId: project._id });
  }
};
