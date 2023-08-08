import expressAsyncHandler from 'express-async-handler';
import User from '../../models/userModel';

interface UserBody {
  papildomiDarbai: { valandinis: number; darbai: { valandos: number; pavadinimas: string }[] };
}

// ------------------------------------------------------------------
// @route PUT /api/user/office
// @access Protected
export const officeUpdateUser = expressAsyncHandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId;
  const { papildomiDarbai } = req.body as UserBody;

  const user = await User.findById(userId);
  if (!user) {
    res.status(400);
    throw new Error('Bad request');
  }

  try {
    user.papildomiDarbai.valandinis = papildomiDarbai.valandinis;
    user.papildomiDarbai.darbai = papildomiDarbai.darbai;

    await user.save();

    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
