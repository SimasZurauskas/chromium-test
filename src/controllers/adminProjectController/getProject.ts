import asynchandler from 'express-async-handler';
import moment from 'moment';
import Project from '../../models/projectModel';
import { customError } from '../../util/customError';
import { formatNumberToFixed } from '../../util/misc';

// @route GET /api/project/admin/:projId
// @access Private Admin
export const getProjectAdmin = asynchandler(async (req, res) => {
  const projId = req.params.projId;
  // @ts-ignore
  const userId = req.userId as string;

  if (!projId || !userId) {
    res.status(400);
    throw customError({ message: 'Bad request' });
  }

  try {
    const project = await Project.findById(projId)
      .lean()
      .populate('atsakingas.user', 'userName')
      .populate('dirba.user', 'userName')
      .populate('dalys.komentarai.user', 'userName')
      .populate('dalys.aktuotaKomentarai.user', 'userName')
      .populate('apskaitaKomentarai.user', 'userName');

    if (!project) {
      res.status(400);
      throw customError({ message: 'Project not found' });
    }

    const canComplete =
      project.atsakingas.progress === 100 &&
      moment(project.atsakingas.patvirtinta).isBefore(moment().subtract(14, 'days'));

    res.status(200).json({
      data: {
        ...project,
        dalys: project.dalys.map((el) => {
          return { ...el, komentaras: '', aktuotaKomentaras: '' };
        }),
        apskaita: {
          ...project.apskaita,
          comment: '',
          aktuotaTpNew: 0,
          aktuotaVpNew: 0,
          tp: formatNumberToFixed(project.apskaita?.tp),
          aktuotaTp: formatNumberToFixed(project.apskaita?.aktuotaTp)
        },
        canComplete
      }
    });
  } catch (error: any) {
    res.status(500);
    throw customError(error);
  }
});
