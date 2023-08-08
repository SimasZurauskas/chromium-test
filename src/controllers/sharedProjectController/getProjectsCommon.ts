import expressAsyncHandler from 'express-async-handler';
import Project, { MProject } from '../../models/projectModel';
import { getStatusesArray, getLatinInsensitiveRegex } from '../../util/misc';

// @route GET /api/project/shared/common
// @access Private
// @query showArchived Live Uzbaigtas Pakibes Nuluzes searchString
export const getProjectsCommon = expressAsyncHandler(async (req, res) => {
  const showArchived = req.query.showArchived;
  const searchString = (req.query.searchString as string) || '';

  const query: { isArchived?: boolean; status: { $in: string[] }; $or: any[] } = {
    isArchived: false,
    status: {
      $in: getStatusesArray({
        live: req.query.Live,
        uzbaigtas: req.query.Uzbaigtas,
        pakibes: req.query.Pakibes,
        nuluzes: req.query.Nuluzes
      })
    },
    $or: [
      { pavadinimas: getLatinInsensitiveRegex(searchString) },
      { uzsakovas: getLatinInsensitiveRegex(searchString) },
      { projektoNr: getLatinInsensitiveRegex(searchString) }
    ]
  };

  if (showArchived) {
    delete query.isArchived;
  }

  // @ts-ignore
  const projects = (await Project.find(query)
    .populate('atsakingas.user', 'userName')
    .populate('dirba.user', 'userName')
    .populate('dalys.user')
    .populate('pastabos.user', 'userName')
    .sort({ createdAt: -1 })) as MProject[];

  const mapped = projects.map((el) => {
    const latestDate = el.pastabos[el.pastabos.length - 1] ? el.pastabos[el.pastabos.length - 1].date : undefined;
    return {
      ...el.toObject(),
      pastabos: { pastabos: el.pastabos, latestDate },
      subrangovai: el.dalys.map((el) => {
        return {
          isComplete: el.aktuotaProc >= 100,
          dalis: el.dalis,
          // @ts-ignore
          userName: el.user.userName
        };
      })
    };
  });

  res.status(200).json({ data: mapped });
});
