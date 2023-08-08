import asynchandler from 'express-async-handler';
import { DEFAULT_USER } from '../../config/other';
import Project from '../../models/projectModel';
import { getStatusesArray } from '../../util/misc';

// @route GET /api/stats/admin/projects
// @access Protected Admin
// @query showArchived Live Uzbaigtas Pakibes Nuluzes
export const getStatsProjects = asynchandler(async (req, res) => {
  const showArchived = req.query.showArchived;

  const query: { isArchived?: boolean; status: { $in: string[] } } = {
    isArchived: false,
    status: {
      $in: getStatusesArray({
        live: req.query.Live,
        uzbaigtas: req.query.Uzbaigtas,
        pakibes: req.query.Pakibes,
        nuluzes: req.query.Nuluzes
      })
    }
  };

  if (showArchived) {
    delete query.isArchived;
  }

  try {
    const stats = await Project.find(query)
      .select('projektoNr pavadinimas atsakingas dirba pay dps_pradzia dps_pabaiga')
      .populate({
        path: 'atsakingas.user',
        select: 'userName',
        match: { userName: { $ne: DEFAULT_USER } }
      })
      .populate({
        path: 'dirba.user',
        select: 'userName',
        match: { userName: { $ne: DEFAULT_USER } }
      });

    res.status(200).json({ data: stats });
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
