import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import User from '../../models/userModel';

// @route PUT /api/stats/shared/:userId/patvirtinta
// @access Protected Admin
export const submitPatvirtintaPapildomi = expressAsyncHandler(async (req, res) => {
  const userId = req.params.userId;
  const isPatvirtinta = req.body.isPatvirtinta;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  try {
    if (isPatvirtinta) {
      user.papildomiDarbai.patvirtinta = moment(new Date()).toISOString();
    } else {
      user.papildomiDarbai.patvirtinta = undefined;
    }

    await user.save();
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
