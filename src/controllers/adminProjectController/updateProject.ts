import asynchandler from 'express-async-handler';
import moment from 'moment';
import Project from '../../models/projectModel';
import { ProjectStatus, Tipas } from '../../types';
import {
  addDirba,
  addEngineer,
  removeDirba,
  removeEngineer,
  updateAtsakingas,
  updateDirba,
  updateEngineerAdmin
} from '../../util/controllerHandlers';
import { customError } from '../../util/customError';
import { getWeightedPercentage } from '../../util/misc';

interface UpdateProjectBody {
  // Base
  projektoNr: string;
  pavadinimas: string;
  uzsakovas: string;
  tipas: Tipas;
  pradzia: string;
  pabaiga: string;
  terminasPagalSutarti: string;
  gautiDoc: string;
  apskaita: {
    tp: number;
    vp: number;
    aktuotaTp: number;
    aktuotaVp: number;
    aktuotaTpNew: number;
    aktuotaVpNew: number;
    comment: string;
  };

  // Ikainiai
  atsakingas: {
    user: string;
    ikainis: number;
    pateikta?: string;
    patvirtinta?: string;
    premija: { suma: number; ivykdzius: number };
  };
  dirba: {
    _id: string;
    user: string;
    ikainis: number;
    progress: number;
    premija: { suma: number; ivykdzius: number };
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
    aktuota: number;
    aktuotaKomentaras: string;
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
  isArchived: boolean;
  status: ProjectStatus;
}

// ------------------------------------------------------------------
// @route POST /api/project/admin/:projId
// @access Private Admin
export const updateProjectAdmin = asynchandler(async (req, res) => {
  const body = req.body as UpdateProjectBody;
  const projId = req.params.projId;
  // @ts-ignore
  const reqUserId = req.userId as string;

  const project = await Project.findById(projId);

  // console.log(body.dalys);

  if (!project) {
    res.status(404);
    throw customError({ message: 'Project not found' });
  }

  let apskaitaComment: { comment: string; aktuota: number; user: string; date: string } | undefined = undefined;

  const aktuotaTpTotal = (body.apskaita.aktuotaTpNew || 0) + project.apskaita.aktuotaTp;
  const aktuotaVpTotal = (body.apskaita.aktuotaVpNew || 0) + project.apskaita.aktuotaVp;

  if (
    body.apskaita.comment ||
    project.apskaita.aktuotaTp !== aktuotaTpTotal ||
    project.apskaita.aktuotaVp !== aktuotaVpTotal
  ) {
    apskaitaComment = {
      comment: body.apskaita.comment || '',
      aktuota: (body.apskaita.aktuotaTpNew || 0) + (body.apskaita.aktuotaVpNew || 0),
      user: reqUserId,
      date: moment(new Date()).toISOString()
    };
  }

  const apskaita = {
    tp: body.apskaita.tp,
    vp: body.apskaita.vp,
    aktuotaTp: aktuotaTpTotal,
    aktuotaVp: aktuotaVpTotal,
    tpDone: aktuotaTpTotal >= body.apskaita.tp,
    vpDone: aktuotaVpTotal >= body.apskaita.vp
  };

  try {
    // PAY
    project.pay.ikainis = body.atsakingas.ikainis + body.dirba.reduce((acc, el) => acc + +el.ikainis, 0);

    // Base
    project.projektoNr = body.projektoNr;
    project.pavadinimas = body.pavadinimas;
    project.uzsakovas = body.uzsakovas;
    project.tipas = body.tipas;
    project.pradzia = body.pradzia;
    project.pabaiga = body.pabaiga;
    project.terminasPagalSutarti = body.terminasPagalSutarti;
    project.gautiDoc = body.gautiDoc;
    project.apskaita = apskaita;
    project.apskaitaKomentarai = apskaitaComment
      ? [apskaitaComment, ...project.apskaitaKomentarai]
      : project.apskaitaKomentarai;

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
    project.status = body.status;
    project.isArchived = body.isArchived;

    // ATSAKINGAS
    const totalBaigtumas =
      getWeightedPercentage(
        body.dirba.map((el) => {
          return { weight: el.ikainis || 0, value: el.progress || 0 };
        })
      ) || 0;

    await updateAtsakingas(body.atsakingas, project, totalBaigtumas);

    // DIRBA
    await removeDirba(body.dirba, project);
    await updateDirba(body.dirba, project);
    await addDirba(body.dirba, project);

    // ENGINEER
    await removeEngineer(body.dalys, project);
    await updateEngineerAdmin(body.dalys, project, reqUserId);
    await addEngineer(body.dalys, project, reqUserId);

    await project.save();

    res.sendStatus(201);
  } catch (error: any) {
    res.status(500);
    throw customError({ error });
  }
});
