import expressAsyncHandler from 'express-async-handler';
import Project, { MProject } from '../../models/projectModel';
import { Worker } from '../../types';

interface ProjectExtended extends Omit<MProject, 'dirba' | 'atsakingas' | 'attachments' | 'dalys'> {
  dirba: Worker[];
  atsakingas: Worker;
  dalys: Worker[];
}

// @route GET /api/project/engineer/:projId
// @access Private
export const getProjectEng = expressAsyncHandler(async (req, res) => {
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

  if (!project.dalys.some((el) => el.user?._id.toString() === userId)) {
    res.status(401);
    throw new Error('Unauthorized');
  }

  const isAtsakingas = project.atsakingas.user?._id.toString() === userId;

  res.status(200).json({
    data: {
      ...project,
      dalys: project.dalys.map((el) => {
        return { ...el, komentaras: '' };
      }),
      isAtsakingas
    }
  });
});
