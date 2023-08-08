import asynchandler from 'express-async-handler';
import Project from '../../models/projectModel';
import { updateEngineerOffice } from '../../util/controllerHandlers';

interface UpdateProjectBody {
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
}

// ------------------------------------------------------------------
// @route POST /api/project/engineer/:projId
// @access Private
export const updateProjectEng = asynchandler(async (req, res) => {
  const body = req.body as UpdateProjectBody;
  const projId = req.params.projId;

  // @ts-ignore
  const reqUserId = req.userId as string;

  const project = await Project.findById(projId);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  // console.log(body.dalys);

  try {
    await updateEngineerOffice(body.dalys, project, reqUserId, true);

    await project.save();

    res.sendStatus(201);
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
