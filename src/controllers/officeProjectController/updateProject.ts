import asynchandler from 'express-async-handler';
import { find } from 'lodash';
import Project from '../../models/projectModel';
import { ProjectStatus, Tipas } from '../../types';
import {
  addEngineerAtsakingas,
  generatePremija,
  removeEngineer,
  updateEngineerOffice
} from '../../util/controllerHandlers';
import { calcValueOfPercentage, getFinishDate, getWeightedPercentage } from '../../util/misc';

interface UpdateProjectBody {
  isAtsakingas: boolean;
  // Base
  projektoNr: string;
  pavadinimas: string;
  uzsakovas: string;
  tipas: Tipas;
  pradzia: string;
  pabaiga: string;
  gautiDoc: string;

  // Ikainiai
  atsakingas: { user?: string };
  dirba: {
    user: string;
    ikainis: number;
    progress: number;
  }[];
  dalys: {
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
  }[];

  // Sąlygos
  topo_uzprasyta: string;
  topo_gauta: string;
  salygos_dujos_uzprasyta: string;
  salygos_dujos_gauta: string;
  salygos_vanduo_uzprasyta: string;
  salygos_vanduo_gauta: string;
  salygos_energija_uzprasyta: string;
  salygos_energija_gauta: string;
  salygos_eso_uzprasyta: string;
  salygos_eso_gauta: string;
  archReikalavimai_uzprasyta: string;
  archReikalavimai_gauta: string;
  kvadReikalavimai_uzprasyta: string;
  kvadReikalavimai_gauta: string;

  // Pasirengimo
  techUzduotis_paruosta: string;
  techUzduotis_patvirtinta: string;
  pateiktiRuosiniai: string;
  pateiktaSo: string;

  // Pristatymas
  esamaSituacija: string;
  detales: string;
  projektuojamaSituacija_breziniai: string;
  projektuojamaSituacija_ar: string;
  projektuojamaSituacija_kiekiai: string;
  konstrukcijos: string;
  techSpecifikacijos: string;
  pristatymas_suderintaData: string;

  // Derinimai
  pritarimasProjektui_gauta: string;
  pritarimasProjektui_komentaras: string;
  TDP_gauta: string;
  TDP_komentaras: string;
  NZT_pateikta: string;
  NZT_gauta: string;
  spalviniai_suderinta: string;
  ekspertuoja: string;
  ekspertize_pateikta: string;
  ekspertize_pastabos: string;
  ekspertize_aktas: string;
  infoStatyba_ikelta: string;
  infoStatyba_leidimas: string;

  // Bottom
  // isArchived: boolean;
  status: ProjectStatus;
}

// ------------------------------------------------------------------
// @route POST /api/project/office/:projId
// @access Private
export const updateProjectOffice = asynchandler(async (req, res) => {
  const body = req.body as UpdateProjectBody;
  const projId = req.params.projId;

  // @ts-ignore
  const reqUserId = req.userId as string;
  const isAtsakingas = body.isAtsakingas;

  const project = await Project.findById(projId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  try {
    // Base
    // project.projektoNr = body.projektoNr; //disabled
    // project.pavadinimas = body.pavadinimas; //disabled
    // project.uzsakovas = body.uzsakovas; //disabled
    project.tipas = body.tipas;
    // project.pradzia = body.pradzia; //disabled
    // project.pabaiga = body.pabaiga; //disabled
    project.gautiDoc = body.gautiDoc;

    // Sąlygos
    project.topo_uzprasyta = body.topo_uzprasyta;
    project.topo_gauta = body.topo_gauta;
    project.salygos_dujos_uzprasyta = body.salygos_dujos_uzprasyta;
    project.salygos_dujos_gauta = body.salygos_dujos_gauta;
    project.salygos_vanduo_uzprasyta = body.salygos_vanduo_uzprasyta;
    project.salygos_vanduo_gauta = body.salygos_vanduo_gauta;
    project.salygos_energija_uzprasyta = body.salygos_energija_uzprasyta;
    project.salygos_energija_gauta = body.salygos_energija_gauta;
    project.salygos_eso_uzprasyta = body.salygos_eso_uzprasyta;
    project.salygos_eso_gauta = body.salygos_eso_gauta;
    project.archReikalavimai_uzprasyta = body.archReikalavimai_uzprasyta;
    project.archReikalavimai_gauta = body.archReikalavimai_gauta;
    project.kvadReikalavimai_uzprasyta = body.kvadReikalavimai_uzprasyta;
    project.kvadReikalavimai_gauta = body.kvadReikalavimai_gauta;

    // Pasirengimo
    project.techUzduotis_paruosta = body.techUzduotis_paruosta;
    project.techUzduotis_patvirtinta = body.techUzduotis_patvirtinta;
    project.pateiktiRuosiniai = body.pateiktiRuosiniai;
    project.pateiktaSo = body.pateiktaSo;

    // Pristatymas
    project.esamaSituacija = body.esamaSituacija;
    project.detales = body.detales;
    project.projektuojamaSituacija_breziniai = body.projektuojamaSituacija_breziniai;
    project.projektuojamaSituacija_ar = body.projektuojamaSituacija_ar;
    project.projektuojamaSituacija_kiekiai = body.projektuojamaSituacija_kiekiai;
    project.konstrukcijos = body.konstrukcijos;
    project.techSpecifikacijos = body.techSpecifikacijos;
    project.pristatymas_suderintaData = body.pristatymas_suderintaData;

    // Derinimai
    project.pritarimasProjektui_gauta = body.pritarimasProjektui_gauta;
    project.pritarimasProjektui_komentaras = body.pritarimasProjektui_komentaras;
    project.TDP_gauta = body.TDP_gauta;
    project.TDP_komentaras = body.TDP_komentaras;
    project.NZT_pateikta = body.NZT_pateikta;
    project.NZT_gauta = body.NZT_gauta;
    project.spalviniai_suderinta = body.spalviniai_suderinta;
    project.ekspertuoja = body.ekspertuoja;
    project.ekspertize_pateikta = body.ekspertize_pateikta;
    project.ekspertize_pastabos = body.ekspertize_pastabos;
    project.ekspertize_aktas = body.ekspertize_aktas;
    project.infoStatyba_ikelta = body.infoStatyba_ikelta;
    project.infoStatyba_leidimas = body.infoStatyba_leidimas;

    // Bottom
    // project.status = body.status;
    // project.isArchived = body.isArchived;

    // ATSAKINGAS
    if (isAtsakingas) {
      const totalBaigtumas =
        getWeightedPercentage(
          body.dirba?.map((el) => {
            return { weight: el.ikainis || 0, value: el.progress || 0 };
          })
        ) || 0;

      const eur = calcValueOfPercentage(
        project.atsakingas.ikainis || 0,
        totalBaigtumas - project.atsakingas.prevProgress
      );

      project.atsakingas.progress = totalBaigtumas;
      project.atsakingas.eur = eur;
      project.atsakingas.likutis =
        (project.atsakingas.ikainis || 0) - calcValueOfPercentage(project.atsakingas.ikainis || 0, totalBaigtumas);
      project.atsakingas.finishDate = getFinishDate({
        existingDate: project.atsakingas.finishDate,
        progress: totalBaigtumas
      });
      project.atsakingas.premija = generatePremija({
        pabaiga: project.pabaiga,
        progress: totalBaigtumas,
        existing: project.atsakingas.premija,
        // @ts-ignore
        incoming: project.atsakingas.premija
      });

      for await (const el of body.dirba) {
        let usr = find(project.dirba, (usr) => usr.user.toString() === el.user);

        if (usr) {
          const eur = calcValueOfPercentage(el.ikainis, el.progress - usr.prevProgress);

          usr.progress = el.progress;
          usr.eur = eur;
          usr.likutis = el.ikainis - calcValueOfPercentage(el.ikainis, el.progress);
          usr.finishDate = getFinishDate({ existingDate: usr.finishDate, progress: el.progress });
          usr.premija = generatePremija({
            pabaiga: project.pabaiga,
            progress: el.progress,
            existing: usr.premija,
            // @ts-ignore
            incoming: usr.premija
          });
        }
      }
    }

    // DIRBA
    if (!isAtsakingas) {
      let user = find(project.dirba, (el) => el.user.toString() === reqUserId);

      const bodyUser = find(body.dirba, (el) => el.user === reqUserId);

      if (user && bodyUser) {
        const eur = calcValueOfPercentage(user.ikainis, bodyUser.progress - user.prevProgress);
        user.progress = bodyUser.progress;
        user.eur = eur;
        user.likutis = user.ikainis - calcValueOfPercentage(user.ikainis, bodyUser.progress);
        user.finishDate = getFinishDate({ existingDate: user.finishDate, progress: bodyUser.progress });
        user.premija = generatePremija({
          pabaiga: project.pabaiga,
          progress: bodyUser.progress,
          existing: user.premija,
          // @ts-ignore
          incoming: user.premija
        });
      }
    }

    // ENGINEER
    if (isAtsakingas) {
      await removeEngineer(body.dalys, project);
      await updateEngineerOffice(body.dalys, project, reqUserId, true);
      await addEngineerAtsakingas(body.dalys, project, reqUserId);
    } else {
      await updateEngineerOffice(body.dalys, project, reqUserId);
    }

    await project.save();

    res.sendStatus(201);
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
