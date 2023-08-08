import moment from 'moment';
import { MProject } from '../../models/projectModel';
import { assignProjectEngineer } from './assign';

type AddEngineer = (
  a: {
    _id: string;
    dalis: string;
    user: string;
    ikainis: number;
    progress: number;
    prevProgress: number;
    komentaras: string;
    pirminiaiSprendiniai?: string;
    ekspertizei?: string;
    galutinisProjektas?: string;
    aktuota: number;
    aktuotaKomentaras: string;
  }[],
  b: MProject,
  c: string
) => Promise<void>;

export const addEngineer: AddEngineer = async (dalys, project, reqUserId) => {
  const newDalys = dalys.filter((el) => !Boolean(el._id));

  for await (const el of newDalys) {
    const hasComment = Boolean(el.komentaras);
    const hasAktuotaComment = Boolean(el.aktuotaKomentaras || el.aktuota);

    const comment = {
      comment: el.komentaras,
      date: moment(new Date()).toISOString(),
      user: reqUserId
    };

    const aktuotaComment = {
      comment: el.aktuotaKomentaras,
      aktuota: el.aktuota || 0,
      date: moment(new Date()).toISOString(),
      user: reqUserId
    };

    project.dalys.push({
      ...el,
      startDate: moment(new Date()).toISOString(),
      komentarai: hasComment ? [comment] : [],
      aktuotaProc: 0,
      aktuotaKomentarai: hasAktuotaComment ? [aktuotaComment] : []
    });
    await assignProjectEngineer(el.dalis, { userId: el.user, projId: project._id });
  }
};

// ATSAKINGAS

type AddEngineerAtsakingas = (
  a: {
    _id: string;
    dalis: string;
    user: string;
    ikainis: number;
    progress: number;
    prevProgress: number;
    komentaras: string;
    pirminiaiSprendiniai?: string;
    ekspertizei?: string;
    galutinisProjektas?: string;
  }[],
  b: MProject,
  c: string
) => Promise<void>;

export const addEngineerAtsakingas: AddEngineerAtsakingas = async (dalys, project, reqUserId) => {
  const newDalys = dalys.filter((el) => !Boolean(el._id));

  for await (const el of newDalys) {
    const hasComment = Boolean(el.komentaras);

    const comment = {
      comment: el.komentaras,
      date: moment(new Date()).toISOString(),
      user: reqUserId
    };

    project.dalys.push({
      ...el,
      startDate: moment(new Date()).toISOString(),
      komentarai: hasComment ? [comment] : [],
      aktuota: 0,
      aktuotaProc: 0,
      aktuotaKomentarai: []
    });
    await assignProjectEngineer(el.dalis, { userId: el.user, projId: project._id });
  }
};
