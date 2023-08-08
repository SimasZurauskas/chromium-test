import expressAsyncHandler from 'express-async-handler';
import Project, { MProject } from '../../models/projectModel';
import { getStatusesArray, getLatinInsensitiveRegex } from '../../util/misc';

type Query = {
  $or: (
    | {
        'dirba.user': string;
      }
    | {
        'atsakingas.user': string;
      }
  )[];
  isArchived?: boolean | undefined;
  status: {
    $in: string[];
  };
};

// @route GET /api/project/office
// @access Private
// @query showArchived Live Uzbaigtas Pakibes Nuluzes
export const getProjectsMy = expressAsyncHandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId as string;

  const showArchived = req.query.showArchived;
  const searchString = (req.query.searchString as string) || '';

  const query: Query = {
    // @ts-ignore
    $and: [
      {
        $or: [{ 'dirba.user': userId }, { 'atsakingas.user': userId }]
      },
      {
        $or: [
          { pavadinimas: getLatinInsensitiveRegex(searchString) },
          { uzsakovas: getLatinInsensitiveRegex(searchString) },
          { projektoNr: getLatinInsensitiveRegex(searchString) }
        ]
      }
    ],
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
    const projects = (await Project.find(query)
      .populate('atsakingas.user', 'userName')
      .populate('dirba.user', 'userName')
      .populate('dalys.user')
      .populate('pastabos.user', 'userName')
      .sort({ createdAt: -1 })) as MProject[];

    const mapped = projects.map((el) => {
      const latestDate = el.pastabos[el.pastabos.length - 1] ? el.pastabos[el.pastabos.length - 1].date : undefined;

      // @ts-ignore
      const userIsAtsakingas = el.atsakingas.user?._id.toString() === userId;
      // @ts-ignore
      const userIsDirba = el.dirba.find((el) => el.user?._id.toString() === userId);

      let atsakingasIkainis = 0;
      let dirbaIkainis = 0;

      let atsakingasEur = 0;
      let dirbaEur = 0;
      if (userIsAtsakingas) {
        atsakingasIkainis = el.atsakingas.ikainis || 0;
        atsakingasEur = el.atsakingas.eur;
      }
      if (userIsDirba) {
        dirbaIkainis = userIsDirba.ikainis;
        dirbaEur = userIsDirba.eur;
      }
      const totalIkainis = atsakingasIkainis + dirbaIkainis;
      const totalEur = atsakingasEur + dirbaEur;

      return {
        ...el.toObject(),
        pastabos: { pastabos: el.pastabos, latestDate },
        totalIkainis,
        totalEur,
        likutis: totalIkainis - totalEur,
        pateikta: !Boolean(el.atsakingas.user) ? null : Boolean(el.atsakingas.pateikta),
        patvirtinta: !Boolean(el.atsakingas.user) ? null : Boolean(el.atsakingas.patvirtinta),
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
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
