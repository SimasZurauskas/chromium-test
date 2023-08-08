import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import Project from '../../models/projectModel';
import { assignProjectAtsakingas, assignProjectDirba, assignProjectEngineer } from '../../util/controllerHandlers';
import { customError } from '../../util/customError';

interface CreateProjectBody {
  projektoNr: string;
  pavadinimas: string;
  apskaita: { tp: number; vp: number; aktuotaTpNew: number; aktuotaVpNew: number; comment: string };
  atsakingas: { user?: string; ikainis?: number; premija: { suma: number; ivykdzius: number } };
  dirba: { user: string; ikainis: number; premija: { suma: number; ivykdzius: number } }[];
  dalys: { dalis: string; user: string; ikainis: number }[];
  pastabos: string;
  uzsakovas: string;
  tipas: string;
  pradzia: string;
  pabaiga: string;
  terminasPagalSutarti: string;
  gautiDoc: string;
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

  techUzduotis_paruosta: string;
  techUzduotis_patvirtinta: string;
  pateiktiRuosiniai: string;
  pateiktaSo: string;
  esamaSituacija: string;

  detales: string;
  projektuojamaSituacija_breziniai: string;
  projektuojamaSituacija_ar: string;
  projektuojamaSituacija_kiekiai: string;
  konstrukcijos: string;
  techSpecifikacijos: string;
  pristatymas_suderintaData: string;

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
}

// @route POST /api/project/admin
// @access Private Admin
export const createProjectAdmin = expressAsyncHandler(async (req, res) => {
  const body = req.body as CreateProjectBody;
  // @ts-ignore
  const userId = req.userId as string;

  const atsakingas = {
    user: body.atsakingas.user,
    ikainis: body.atsakingas.ikainis,
    baigtumas: 0,
    startDate: body.atsakingas.user ? moment(new Date()).toISOString() : undefined,
    likutis: body.atsakingas.ikainis || 0,
    premija: body.atsakingas.premija
  };

  if (!body.atsakingas.user) {
    delete atsakingas.user;
    delete atsakingas.ikainis;
  }

  const dirba = body.dirba.map((el) => {
    return { ...el, startDate: moment(new Date()).toISOString(), likutis: el.ikainis };
  });

  const dalys = body.dalys.map((el) => {
    return { ...el, startDate: moment(new Date()).toISOString() };
  });

  const pastaba = {
    comment: body.pastabos,
    user: userId,
    date: moment(new Date()).toISOString()
  };

  const timeline = atsakingas.user
    ? [
        {
          date: moment(new Date()).toISOString(),
          dateId: moment(new Date()).format('YYYY-MM'),
          baigtumas: 0,
          prevBaigtumas: 0
        }
      ]
    : [];

  let apskaitaComment: { comment: string; aktuota: number; user: string; date: string } | undefined = undefined;

  if (body.apskaita.comment) {
    apskaitaComment = {
      comment: body.apskaita.comment,
      aktuota: (body.apskaita.aktuotaTpNew || 0) + (body.apskaita.aktuotaVpNew || 0),
      user: userId,
      date: moment(new Date()).toISOString()
    };
  }

  const apskaita = {
    tp: body.apskaita.tp,
    vp: body.apskaita.vp,
    aktuotaTp: body.apskaita.aktuotaTpNew || 0,
    aktuotaVp: body.apskaita.aktuotaVpNew || 0,
    tpDone: body.apskaita.aktuotaTpNew >= body.apskaita.tp,
    vpDone: body.apskaita.aktuotaVpNew >= body.apskaita.vp
  };

  try {
    const project = await Project.create({
      projektoNr: body.projektoNr,
      pavadinimas: body.pavadinimas,
      uzsakovas: body.uzsakovas,
      tipas: body.tipas,
      apskaita,
      apskaitaKomentarai: apskaitaComment ? [apskaitaComment] : [],
      atsakingas,
      dirba,
      dalys,
      timeline,
      pay: { ikainis: (body.atsakingas.ikainis || 0) + body.dirba.reduce((acc, el) => acc + (el.ikainis || 0), 0) },
      pastabos: body.pastabos ? [pastaba] : [],
      pradzia: body.pradzia,
      pabaiga: body.pabaiga,
      terminasPagalSutarti: body.terminasPagalSutarti,
      gautiDoc: body.gautiDoc,
      topo_uzprasyta: body.topo_uzprasyta,
      topo_gauta: body.topo_gauta,
      salygos_dujos_uzprasyta: body.salygos_dujos_uzprasyta,
      salygos_dujos_gauta: body.salygos_dujos_gauta,
      salygos_vanduo_uzprasyta: body.salygos_vanduo_uzprasyta,
      salygos_vanduo_gauta: body.salygos_vanduo_gauta,
      salygos_energija_uzprasyta: body.salygos_energija_uzprasyta,
      salygos_energija_gauta: body.salygos_energija_gauta,
      salygos_eso_uzprasyta: body.salygos_eso_uzprasyta,
      salygos_eso_gauta: body.salygos_eso_gauta,
      archReikalavimai_uzprasyta: body.archReikalavimai_uzprasyta,
      archReikalavimai_gauta: body.archReikalavimai_gauta,
      kvadReikalavimai_uzprasyta: body.kvadReikalavimai_uzprasyta,
      kvadReikalavimai_gauta: body.kvadReikalavimai_gauta,

      techUzduotis_paruosta: body.techUzduotis_paruosta,
      techUzduotis_patvirtinta: body.techUzduotis_patvirtinta,
      pateiktiRuosiniai: body.pateiktiRuosiniai,
      pateiktaSo: body.pateiktaSo,
      esamaSituacija: body.esamaSituacija,

      detales: body.detales,
      projektuojamaSituacija_breziniai: body.projektuojamaSituacija_breziniai,
      projektuojamaSituacija_ar: body.projektuojamaSituacija_ar,
      projektuojamaSituacija_kiekiai: body.projektuojamaSituacija_kiekiai,
      konstrukcijos: body.konstrukcijos,
      techSpecifikacijos: body.techSpecifikacijos,
      pristatymas_SuderintaData: body.pristatymas_suderintaData,

      pritarimasProjektui_gauta: body.pritarimasProjektui_gauta,
      pritarimasProjektui_komentaras: body.pritarimasProjektui_komentaras,
      TDP_gauta: body.TDP_gauta,
      TDP_komentaras: body.TDP_komentaras,
      NZT_pateikta: body.NZT_pateikta,
      NZT_gauta: body.NZT_gauta,
      spalviniai_suderinta: body.spalviniai_suderinta,
      ekspertuoja: body.ekspertuoja,
      ekspertize_pateikta: body.ekspertize_pateikta,
      ekspertize_pastabos: body.ekspertize_pastabos,
      ekspertize_aktas: body.ekspertize_aktas,
      infoStatyba_ikelta: body.infoStatyba_ikelta,
      infoStatyba_leidimas: body.infoStatyba_leidimas
    });

    if (atsakingas.user) {
      await assignProjectAtsakingas({ userId: atsakingas.user, projId: project._id });
    }

    for await (const el of body.dirba) {
      await assignProjectDirba({ userId: el.user, projId: project._id });
    }

    for await (const el of body.dalys) {
      await assignProjectEngineer(el.dalis, { userId: el.user, projId: project._id });
    }
  } catch (error: any) {
    res.status(500);
    throw customError(error);
  }

  res.sendStatus(201);
});
