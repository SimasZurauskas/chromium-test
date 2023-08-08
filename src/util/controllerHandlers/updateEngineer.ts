import { findIndex } from 'lodash';
import moment from 'moment';
import { MProject } from '../../models/projectModel';
import { calculatePercentage } from '../misc';
import { assignProjectEngineer, unAssignProjectEngineer } from './assign';

type UpdateEngineerAdmin = (
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

export const updateEngineerAdmin: UpdateEngineerAdmin = async (dalys, project, reqUserId) => {
  const incommingDalys = dalys.map((el) => el._id).filter((el) => Boolean(el));

  for await (const el of incommingDalys) {
    const existingDalisIdx = findIndex(project.dalys, (el2) => el2._id.toString() === el.toString());
    const incomingDalisIdx = findIndex(dalys, (el2) => el2._id.toString() === el.toString());

    if (existingDalisIdx !== -1 && incomingDalisIdx !== -1) {
      const existingDalis = project.dalys[existingDalisIdx];
      const newDalis = dalys[incomingDalisIdx];

      const hasComment = Boolean(newDalis.komentaras);
      const hasAktuotaComment = Boolean(newDalis.aktuotaKomentaras) || existingDalis.aktuota !== newDalis?.aktuota;

      const comment = {
        comment: newDalis.komentaras,
        date: moment(new Date()).toISOString(),
        user: reqUserId
      };

      const aktuotaComment = {
        comment: newDalis.aktuotaKomentaras,
        aktuota: newDalis.aktuota || 0,
        date: moment(new Date()).toISOString(),
        user: reqUserId
      };

      if (existingDalis.user.toString() !== newDalis.user) {
        console.log('SWITCHING ENGINEERS');
        await unAssignProjectEngineer(existingDalis.dalis, { userId: existingDalis.user, projId: project._id });
        await assignProjectEngineer(newDalis.dalis, { userId: newDalis.user, projId: project._id });
      }

      existingDalis.dalis = newDalis.dalis;
      existingDalis.user = newDalis.user;
      existingDalis.ikainis = newDalis.ikainis;
      existingDalis.progress = newDalis.progress;
      existingDalis.komentarai = hasComment ? [comment, ...existingDalis.komentarai] : existingDalis.komentarai;
      existingDalis.pirminiaiSprendiniai = newDalis.pirminiaiSprendiniai;
      existingDalis.ekspertizei = newDalis.ekspertizei;
      existingDalis.galutinisProjektas = newDalis.galutinisProjektas;
      existingDalis.aktuota = newDalis.aktuota;
      existingDalis.aktuotaProc = calculatePercentage(newDalis.aktuota, newDalis.ikainis);
      existingDalis.aktuotaKomentarai = hasAktuotaComment
        ? [aktuotaComment, ...existingDalis.aktuotaKomentarai]
        : existingDalis.aktuotaKomentarai;
    }
  }
};

// OFFICE

type UpdateEngineerOffice = (
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
  c: string,
  d?: boolean
) => Promise<void>;

export const updateEngineerOffice: UpdateEngineerOffice = async (dalys, project, reqUserId, isAtsakingas) => {
  const incommingDalys = dalys.map((el) => el._id).filter((el) => Boolean(el));

  incommingDalys.forEach((el) => {
    const existingDalisIdx = findIndex(project.dalys, (el2) => el2._id.toString() === el.toString());
    const incomingDalisIdx = findIndex(dalys, (el2) => el2._id.toString() === el.toString());

    if (existingDalisIdx !== -1 && incomingDalisIdx !== -1) {
      const existingDalis = project.dalys[existingDalisIdx];
      const newDalis = dalys[incomingDalisIdx];

      const hasComment = Boolean(newDalis.komentaras);

      const comment = {
        comment: newDalis.komentaras,
        date: moment(new Date()).toISOString(),
        user: reqUserId
      };

      existingDalis.komentarai = hasComment ? [comment, ...existingDalis.komentarai] : existingDalis.komentarai;

      if (isAtsakingas) {
        existingDalis.dalis = newDalis.dalis;
        existingDalis.ikainis = newDalis.ikainis;
        existingDalis.progress = newDalis.progress;
        existingDalis.pirminiaiSprendiniai = newDalis.pirminiaiSprendiniai;
        existingDalis.ekspertizei = newDalis.ekspertizei;
        existingDalis.galutinisProjektas = newDalis.galutinisProjektas;
      }
    }
  });
};
