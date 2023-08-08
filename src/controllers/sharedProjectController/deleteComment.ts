import asynchandler from 'express-async-handler';
import Project from '../../models/projectModel';

// @route DELETE /api/project/shared/:projId/comment/:commentId
// @access Private
export const deleteComment = asynchandler(async (req, res) => {
  const projId = req.params.projId;
  const commentId = req.params.commentId;

  try {
    await Project.findOneAndUpdate(
      { _id: projId },
      {
        $pull: {
          'dalys.$[].komentarai': { _id: commentId }
        }
      }
    );

    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
