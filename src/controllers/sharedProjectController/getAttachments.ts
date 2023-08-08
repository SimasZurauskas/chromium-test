import asynchandler from 'express-async-handler';
import Project from '../../models/projectModel';

// @route GET /api/project/shared/:projId/attachment
// @access Private
export const getAttachments = asynchandler(async (req, res) => {
  const projId = req.params.projId;

  const project = await Project.findById(projId)
    .lean()
    .populate('attachments.RUOSINIAI.files', 'originalName size thumbnailUrl')
    .populate('attachments.RUOSINIAI.user', 'userName')
    .populate('attachments.FOTO.files', 'originalName size thumbnailUrl')
    .populate('attachments.FOTO.user', 'userName')
    .populate('attachments.PRIDAVIMO_DOC.files', 'originalName size thumbnailUrl')
    .populate('attachments.PRIDAVIMO_DOC.user', 'userName')
    .populate('attachments.SALYGOS.files', 'originalName size thumbnailUrl')
    .populate('attachments.SALYGOS.user', 'userName')
    .populate('attachments.TOPO.files', 'originalName size thumbnailUrl')
    .populate('attachments.TOPO.user', 'userName')
    .populate('attachments.PROJEKTAS.files', 'originalName size thumbnailUrl')
    .populate('attachments.PROJEKTAS.user', 'userName')
    .populate('attachments.KITA.files', 'originalName size thumbnailUrl')
    .populate('attachments.KITA.user', 'userName');

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  res.status(200).json({ data: project.attachments });
});
