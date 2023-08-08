import asynchandler from 'express-async-handler';
import Project, { MProject } from '../../models/projectModel';
import { customError } from '../../util/customError';
import { getLatinInsensitiveRegex, getStatusesArray } from '../../util/misc';

type Query = {
  tipas?: string;
  isArchived?: boolean;
  status: { $in: string[] };
  $and: any[];
  'apskaita.tpDone'?: { $ne: true };
  'apskaita.vpDone'?: { $ne: true };
};

// @route GET /api/project/admin
// @access Private Admin
// @query showArchived Live Uzbaigtas Pakibes Nuluzes searchString projectsSearchUserId tipas
export const getProjectsAdmin = asynchandler(async (req, res) => {
  const showArchived = req.query.showArchived;
  const searchString = (req.query.searchString as string) || '';
  const projectsSearchUserId = req.query.projectsSearchUserId as string;
  const tipas = req.query.tipas as string;
  const apskaitaTogles = req.query.apskaitaToggles as
    | {
        tp: 'true' | 'false';
        vp: 'true' | 'false';
      }
    | undefined;

  const queryArr: any[] = [
    {
      $or: [
        { pavadinimas: getLatinInsensitiveRegex(searchString) },
        { uzsakovas: getLatinInsensitiveRegex(searchString) },
        { projektoNr: getLatinInsensitiveRegex(searchString) }
      ]
    }
  ];

  if (projectsSearchUserId) {
    queryArr.push({
      $or: [
        { 'atsakingas.user': projectsSearchUserId },
        { 'dirba.user': projectsSearchUserId },
        { 'dalys.user': projectsSearchUserId }
      ]
    });
  }

  const query: Query = {
    tipas,
    isArchived: false,
    status: {
      $in: getStatusesArray({
        live: req.query.Live,
        uzbaigtas: req.query.Uzbaigtas,
        pakibes: req.query.Pakibes,
        nuluzes: req.query.Nuluzes
      })
    },

    $and: queryArr
  };

  if (apskaitaTogles) {
    if (apskaitaTogles.tp === 'false') {
      query['apskaita.tpDone'] = { $ne: true };
    }
    if (apskaitaTogles.vp === 'false') {
      query['apskaita.vpDone'] = { $ne: true };
    }
  }

  if (!tipas) {
    delete query.tipas;
  }

  if (showArchived) {
    delete query.isArchived;
  }

  try {
    const projects = (await Project.find(query)
      .populate('atsakingas.user', 'userName')
      .populate('dirba.user', 'userName')
      .populate('dalys.user', 'userName')
      .populate('pastabos.user', 'userName')
      .sort({ createdAt: -1 })) as MProject[];

    const mapped = projects.map((el) => {
      const latestDate = el.pastabos[el.pastabos.length - 1] ? el.pastabos[el.pastabos.length - 1].date : undefined;
      const totalEurDirba = el.dirba.reduce((acc: number, el: any) => acc + el.eur, 0);
      const totalIkainisDirba = el.dirba.reduce((acc, el) => acc + el.ikainis, 0);

      // console.log(el.dalys);

      // @ts-ignore

      return {
        ...el.toObject(),
        pastabos: { pastabos: el.pastabos, latestDate },
        dirbaIkainis: totalIkainisDirba,
        totalEurDirba,
        likutis: totalIkainisDirba + (el.atsakingas.ikainis || 0) - totalEurDirba - el.atsakingas.eur,
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
    throw customError(error);
  }
});
