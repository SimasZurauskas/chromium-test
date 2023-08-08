import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import { uploadFile } from '../../config/S3';
import FileMeta from '../../models/FileMeta';
import Project from '../../models/projectModel';
import User from '../../models/userModel';
import { DocCategoryEng } from '../../types';

// @route POST /api/project/shared/:projId/attachment-eng
// @access Private
// @files files[]
export const uploadAttachmentEng = expressAsyncHandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId as string;
  const projId = req.params.projId;
  const files = req.files as Express.Multer.File[];
  const docCategory = req.body.docCategory as DocCategoryEng;
  const comment = req.body.comment;
  const dalisId = req.body.dalisId;
  const dalis = req.body.dalis;

  const project = await Project.findById(projId);
  const user = await User.findById(userId);

  if (!project || !user || !docCategory || !dalisId || !dalis) {
    res.status(400);
    throw new Error('Bad request');
  }

  const uploadedFileIds: string[] = [];

  if (files?.length) {
    for (const file of files) {
      const uploadedFile = await uploadFile({
        buffer: file.buffer,
        key: `${projId}/DALYS-${dalis}/${docCategory}/${file.originalname}`,
        originalname: file.originalname
      });

      const fileMeta = await FileMeta.create({
        key: uploadedFile.Key,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size
      });

      uploadedFileIds.push(fileMeta._id);
    }
  }

  let attachment = {
    comment: comment || '',
    user: user._id,
    files: uploadedFileIds,
    date: moment(new Date()).toISOString()
  };

  const projDalis = project.dalys.find((el) => el._id.toString() === dalisId);

  if (projDalis) {
    if (projDalis.attachments) {
      projDalis.attachments[docCategory].push(attachment);
    }
  }

  await project.save();

  res.sendStatus(201);
});
