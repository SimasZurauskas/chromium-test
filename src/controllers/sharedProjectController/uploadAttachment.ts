import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import { uploadFile } from '../../config/S3';
import FileMeta from '../../models/FileMeta';
import Project from '../../models/projectModel';
import User from '../../models/userModel';
import { DocCategory } from '../../types';
import Jimp from 'jimp';

const supportedMimeTypes = [
  'image/jpeg',
  'image/pjpeg',
  'image/png',
  'image/x-png',
  'image/bmp',
  'image/x-windows-bmp',
  'image/tiff',
  'image/x-tiff',
  'image/gif',
  'image/webp'
];

// @route POST /api/project/shared/:projId/attachment
// @access Private
// @files files[]
export const uploadAttachment = expressAsyncHandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId as string;
  const projId = req.params.projId;
  const files = req.files as Express.Multer.File[];
  const docCategory = req.body.docCategory as DocCategory;
  const comment = req.body.comment;

  const project = await Project.findById(projId);
  const user = await User.findById(userId);

  if (!project || !user) {
    res.status(400);
    throw new Error('Bad request');
  }

  const uploadedFileIds: string[] = [];

  if (files?.length) {
    for (const file of files) {
      let thumbnailUrl = '';
      const uploadedFile = await uploadFile({
        buffer: file.buffer,
        key: `${projId}/${docCategory}/${file.originalname}`,
        originalname: file.originalname
      });

      if (docCategory === 'FOTO' && supportedMimeTypes.includes(file.mimetype)) {
        try {
          const thumbImg = await Jimp.read(Buffer.from(file.buffer));
          const resizedThumbImage = thumbImg.resize(250, Jimp.AUTO);
          const compressedThumbImage = resizedThumbImage.quality(80);
          const thumbBuffer = await compressedThumbImage.getBufferAsync(Jimp.MIME_JPEG);

          const uploadedThumb = await uploadFile({
            buffer: thumbBuffer,
            key: `public/thumbnails/${projId}/${file.originalname}`,
            originalname: file.originalname
          });

          thumbnailUrl = uploadedThumb.Location;
        } catch (error) {}
      }

      const fileMeta = await FileMeta.create({
        key: uploadedFile.Key,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        thumbnailUrl
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

  project.attachments[docCategory].push(attachment);

  await project.save();

  res.sendStatus(201);
});
