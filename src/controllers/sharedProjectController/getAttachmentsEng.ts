import asynchandler from 'express-async-handler';
import Project from '../../models/projectModel';
import { DocCategoryEng } from '../../types';

// @route GET /api/project/shared/:projId/attachment-eng/:dalisId/:category
// @access Private
export const getAttachmentsEng = asynchandler(async (req, res) => {
  const projId = req.params.projId;
  const dalisId = req.params.dalisId;
  const category = req.params.category as DocCategoryEng;

  if (!projId || !dalisId || !category) {
    res.status(400);
    throw new Error('Bad request');
  }

  try {
    const project = await Project.findById(projId)
      .lean()
      .populate('dalys.attachments.PIRMINIAI_SPREND.files', 'originalName size thumbnailUrl')
      .populate('dalys.attachments.PIRMINIAI_SPREND.user', 'userName')
      .populate('dalys.attachments.EKSPERTIZEI.files', 'originalName size thumbnailUrl')
      .populate('dalys.attachments.EKSPERTIZEI.user', 'userName')
      .populate('dalys.attachments.GALUTINIS_PROJEKTAS.files', 'originalName size thumbnailUrl')
      .populate('dalys.attachments.GALUTINIS_PROJEKTAS.user', 'userName');

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    const dalis = project.dalys.find((el) => el._id.toString() === dalisId);

    if (!dalis) {
      res.status(404).json({ data: [] });
      return;
    }

    let returnData: { user: string; comment: string; files: string[]; date: string }[] = [];

    if (dalis.attachments) {
      if (dalis.attachments[category]) {
        returnData = dalis.attachments[category];
      }
    }

    res.status(200).json({ data: returnData });
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
