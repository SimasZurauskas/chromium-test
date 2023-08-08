import expressAsyncHandler from 'express-async-handler';
import moment from 'moment';
import User from '../../models/userModel';
import { formatNumberToFixed } from '../../util/misc';

const ADD_DAYS = 0;

// @route PUT /api/stats/admin/reset/user/:userId
// @access Protected Admin
export const resetPayCyclePapildomi = expressAsyncHandler(async (req, res) => {
  const userId = req.params.userId;

  const user = await User.findById(userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const totalHours = user.papildomiDarbai.darbai.reduce((acc, el) => acc + el.valandos, 0);
  const suma = totalHours * user.papildomiDarbai.valandinis;

  if (!!totalHours && !!suma) {
    const paymentData = user.papildomiDarbai.darbai.map((el) => {
      return {
        date: moment(user.papildomiDarbai.patvirtinta).add(ADD_DAYS, 'days').toISOString(),
        dateId: moment(user.papildomiDarbai.patvirtinta).add(ADD_DAYS, 'days').format('YYYY-MM'),
        valandinis: user.papildomiDarbai.valandinis,
        pavadinimas: el.pavadinimas,
        valandos: el.valandos,
        suma: formatNumberToFixed(el.valandos * user.papildomiDarbai.valandinis)
      };
    });

    paymentData.forEach((el) => user.payments.papildomiDarbai.push(el));
  }

  user.papildomiDarbai.pateikta = undefined;
  user.papildomiDarbai.patvirtinta = undefined;
  user.papildomiDarbai.darbai = [];

  await user.save();

  res.sendStatus(204);
});
