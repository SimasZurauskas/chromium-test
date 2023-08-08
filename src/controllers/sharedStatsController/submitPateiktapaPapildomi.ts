import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import User from '../../models/userModel';

// @route PUT /api/stats/shared/:userId/pateikta
// @access Protected Admin
export const submitPateiktapaPapildomi = expressAsyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const isPateikta = req.body.isPateikta;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  try {
    if (isPateikta) {
      user.papildomiDarbai.pateikta = moment(new Date()).toISOString();
    } else {
      user.papildomiDarbai.pateikta = undefined;
    }

    await user.save();
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
