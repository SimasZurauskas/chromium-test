import asynchandler from 'express-async-handler';
import Project, { MProject } from '../../models/projectModel';
import { Worker } from '../../types';

interface ProjectExtended extends Omit<MProject, 'dirba' | 'atsakingas' | 'attachments'> {
  dirba: Worker[];
  atsakingas: Worker;
}

// @route GET /api/project/office/:projId
// @access Private
export const getProject = asynchandler(async (req, res) => {
  const projId = req.params.projId;
  // @ts-ignore
  const userId = req.userId as string;

  const project = (await Project.findById(projId)
    .lean()
    .populate('atsakingas.user', 'userName')
    .populate('dirba.user', 'userName')
    .populate('dalys.komentarai.user', 'userName')) as ProjectExtended;

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  let isMyProject = true;
  if (
    !(
      project.atsakingas.user?._id.toString() === userId ||
      project.dirba.some((el) => el.user?._id.toString() === userId)
    )
  ) {
    isMyProject = false;
  }

  const isAtsakingas = project.atsakingas.user?._id.toString() === userId;

  res.status(200).json({
    data: {
      ...project,
      dalys: project.dalys.map((el) => {
        return { ...el, komentaras: '' };
      }),
      isAtsakingas,
      isMyProject
    }
  });
});
