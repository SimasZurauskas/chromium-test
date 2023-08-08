import expressAsyncHandler from 'express-async-handler';
import { removeFile } from '../../config/S3';
import FileMeta from '../../models/FileMeta';
import Project from '../../models/projectModel';
import { customError } from '../../util/customError';

// @route DELETE /api/project/admin/:projId/fotos
// @access Private Admin
export const adminDeleteAllFotos = expressAsyncHandler(async (req, res) => {
  const projId = req.params.projId as string;

  if (!projId) {
    res.status(400);
    throw customError({ message: 'Invalid request' });
  }

  const project = await Project.findById(projId).populate('attachments.FOTO.files');

  if (!project) {
    res.status(404);
    throw customError({ message: 'Project does not exist' });
  }

  try {
    const fileKeys: { id: string; key: string }[] = [];

    project.attachments.FOTO.forEach((el) => {
      el.files.forEach((file: any) => {
        fileKeys.push({ id: file._id, key: file.key });
      });
    });

    for await (const el of fileKeys) {
      await removeFile(el.key);
      await FileMeta.findByIdAndDelete(el.id);
    }

    project.attachments.FOTO = [];

    await project.save();

    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw customError(error);
  }
});
