import asynchandler from 'express-async-handler';
import { getFile, removeFile } from '../config/S3';
import FileMeta from '../models/FileMeta';
import Project from '../models/projectModel';
import { customError } from '../util/customError';

// @route GET /api/file/:id
// @access Private
const downloadFile = asynchandler(async (req, res) => {
  const id = req.params.id as string;

  if (!id) {
    res.status(400);
    throw customError({ message: 'Invalid request' });
  }

  const fileMeta = await FileMeta.findById(id);

  if (!fileMeta) {
    res.status(404);
    throw customError({ message: 'File does not exist' });
  }

  const data = await getFile(fileMeta.key);

  if (!data) {
    res.status(404);
    throw customError({ message: 'File does not exist' });
  }

  res.status(200).json({
    base64String: Buffer.from(data.Body as Buffer).toString('base64'),
    originalName: fileMeta.originalName,
    mimetype: fileMeta.mimetype
  });
});

// @route DELETE /api/file/:id
// @access Private
const deleteFile = asynchandler(async (req, res) => {
  const id = req.params.id as string;

  if (!id) {
    res.status(400);
    throw customError({ message: 'Invalid request' });
  }

  const fileMeta = await FileMeta.findById(id);

  if (!fileMeta) {
    res.status(404);
    throw customError({ message: 'File does not exist' });
  }

  try {
    const updatedProject = await Project.findOneAndUpdate(
      {
        $or: [
          { 'attachments.RUOSINIAI.files': id },
          { 'attachments.FOTO.files': id },
          { 'attachments.PRIDAVIMO_DOC.files': id },
          { 'attachments.SALYGOS.files': id },
          { 'attachments.TOPO.files': id },
          { 'attachments.PROJEKTAS.files': id },
          { 'attachments.KITA.files': id }
        ]
      },
      {
        $pull: {
          'attachments.RUOSINIAI.$[].files': id,
          'attachments.FOTO.$[].files': id,
          'attachments.PRIDAVIMO_DOC.$[].files': id,
          'attachments.SALYGOS.$[].files': id,
          'attachments.TOPO.$[].files': id,
          'attachments.PROJEKTAS.$[].files': id,
          'attachments.KITA.$[].files': id
        }
      },
      { new: true }
    );

    if (updatedProject) {
      await Project.findByIdAndUpdate(updatedProject._id, {
        $pull: {
          'attachments.RUOSINIAI': { files: { $exists: true, $size: 0 } },
          'attachments.FOTO': { files: { $exists: true, $size: 0 } },
          'attachments.PRIDAVIMO_DOC': { files: { $exists: true, $size: 0 } },
          'attachments.SALYGOS': { files: { $exists: true, $size: 0 } },
          'attachments.TOPO': { files: { $exists: true, $size: 0 } },
          'attachments.PROJEKTAS': { files: { $exists: true, $size: 0 } },
          'attachments.KITA': { files: { $exists: true, $size: 0 } }
        }
      });
    }

    await removeFile(fileMeta.key);
    await fileMeta.remove();

    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw customError({ error });
  }
});

// @route DELETE /api/file/:id/eng
// @access Private
const deleteFileEng = asynchandler(async (req, res) => {
  const id = req.params.id as string;

  if (!id) {
    res.status(400);
    throw customError({ message: 'Invalid request' });
  }

  const fileMeta = await FileMeta.findById(id);

  if (!fileMeta) {
    res.status(404);
    throw customError({ message: 'File does not exist' });
  }

  try {
    const updatedProject = await Project.findOneAndUpdate(
      {
        $or: [
          { 'dalys.attachments.PIRMINIAI_SPREND.files': id },
          { 'dalys.attachments.EKSPERTIZEI.files': id },
          { 'dalys.attachments.GALUTINIS_PROJEKTAS.files': id }
        ]
      },
      {
        $pull: {
          'dalys.$[].attachments.PIRMINIAI_SPREND.$[].files': id,
          'dalys.$[].attachments.EKSPERTIZEI.$[].files': id,
          'dalys.$[].attachments.GALUTINIS_PROJEKTAS.$[].files': id
        }
      },
      { new: true }
    );

    if (updatedProject) {
      await Project.findByIdAndUpdate(updatedProject._id, {
        $pull: {
          'dalys.$[].attachments.PIRMINIAI_SPREND': { files: { $exists: true, $size: 0 } },
          'dalys.$[].attachments.EKSPERTIZEI': { files: { $exists: true, $size: 0 } },
          'dalys.$[].attachments.GALUTINIS_PROJEKTAS': { files: { $exists: true, $size: 0 } }
        }
      });
    }

    await removeFile(fileMeta.key);
    await fileMeta.remove();

    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw customError({ error });
  }
});

export { downloadFile, deleteFile, deleteFileEng };
