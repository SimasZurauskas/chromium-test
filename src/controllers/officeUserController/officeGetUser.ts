import asynchandler from 'express-async-handler';
import User, { MUser } from '../../models/userModel';
import { getUsersProjects, UserExtendedProjects } from '../../util/getUsersProjects';

interface UserJobData {
  eur: number;
  finishDate: string;
  ikainis: number;
  likutis: number;
  progress: number;
  prevProgress: number;
  startDate: string;
  premija: { suma: number; ivykdzius: number; isEligible: boolean; isPaid: boolean };
  user: string;
}

// ------------------------------------------------------------------
// @route GET /api/user/office/:id
// @access Protected
export const officeGetUser = asynchandler(async (req, res) => {
  const id = req.params.id;

  try {
    const user = (await User.findById(id)
      .lean()
      .select('-password -secret -socketId -__v -createdAt -updatedAt')
      .populate('projects.atsakingas.project', '_id pavadinimas  pradzia pabaiga atsakingas')
      .populate('projects.dirba.project', 'pavadinimas pradzia pabaiga atsakingas dirba')
      .populate('projects.engineer.project', 'pavadinimas pradzia pabaiga dalys')
      .populate('payments.atsakingas.project', 'pavadinimas')
      .populate('payments.dirba.project', 'pavadinimas')) as UserExtendedProjects;

    if (!user) {
      res.status(400);
      throw new Error('Bad request');
    }

    const parsedUser = {
      ...user,
      projects: getUsersProjects(user)
    };

    res.status(200).json({ data: parsedUser });
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
