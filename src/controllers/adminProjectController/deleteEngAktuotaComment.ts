import asynchandler from 'express-async-handler';
import Project from '../../models/projectModel';
import { customError } from '../../util/customError';

// @route DELETE /api/project/admin/:projId/eng-aktuota-comment/:commentId
// @access Private Admin
export const deleteEngAktuotaComment = asynchandler(async (req, res) => {
  const projId = req.params.projId;
  const commentId = req.params.commentId;

  try {
    await Project.findOneAndUpdate(
      { _id: projId },
      {
        $pull: {
          'dalys.$[].aktuotaKomentarai': { _id: commentId }
        }
      }
    );

    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw customError(error);
  }
});
