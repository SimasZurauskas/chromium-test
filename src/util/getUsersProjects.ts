import { isEmpty } from 'lodash';
import { MUser } from '../models/userModel';

interface UserJobData {
  eur: number;
  finishDate: string;
  ikainis: number;
  likutis: number;
  progress: number;
  prevProgress: number;
  startDate: string;
  premija: { suma: number; ivykdzius: number; isEligible: boolean; isPaid: boolean };
  user: string;
  pateikta: string;
  patvirtinta: string;
}

export interface UserExtendedProjects extends Omit<MUser, 'projects'> {
  _id: string;
  projects: {
    atsakingas: {
      project: { _id: string; pavadinimas: string; pradzia: string; pabaiga: string; atsakingas: UserJobData };
    }[];
    dirba: {
      project: {
        _id: string;
        pavadinimas: string;
        pradzia: string;
        pabaiga: string;
        atsakingas: UserJobData;
        dirba: UserJobData[];
      };
    }[];
    engineer: {
      dalis: string;
      project: {
        _id: string;
        pavadinimas: string;
        dalys: { dalis: string; user: string; ikainis: number }[];
      };
    }[];
  };
  papildomiDarbai: {
    valandinis: number;
    pateikta?: string;
    patvirtinta?: string;
    darbai: { valandos: number; pavadinimas: string }[];
  };
}

export const getUsersProjects = (user: UserExtendedProjects) => {
  const data = {
    atsakingas:
      user.projects.atsakingas
        ?.filter((el) => !isEmpty(el.project))
        .map((el) => {
          return {
            _id: el.project._id,
            pavadinimas: el.project.pavadinimas,
            baigtumas: el.project.atsakingas.progress,
            pateikta: el.project.atsakingas.pateikta,
            patvirtinta: el.project.atsakingas.patvirtinta,
            pradzia: el.project.pradzia,
            pabaiga: el.project.pabaiga,
            userJobData: el.project.atsakingas
          };
        }) || [],
    dirba:
      user.projects.dirba
        ?.filter((el) => !isEmpty(el.project))
        .map((el) => {
          return {
            _id: el.project._id,
            pavadinimas: el.project.pavadinimas,
            baigtumas: el.project.atsakingas.progress,
            pateikta: el.project.atsakingas.pateikta,
            patvirtinta: el.project.atsakingas.patvirtinta,
            pradzia: el.project.pradzia,
            pabaiga: el.project.pabaiga,
            userJobData: el.project?.dirba.find((d) => d.user.toString() === user._id.toString())
          };
        }) || [],
    engineer:
      user.projects.engineer
        ?.filter((el) => !isEmpty(el.project))
        .map((el) => {
          return {
            ...el,
            project: {
              ...el.project,
              dalys: el.project?.dalys.find((d) => d.user.toString() === user._id.toString() && el.dalis === d.dalis)
            }
          };
        }) || []
  };

  return data;
};
