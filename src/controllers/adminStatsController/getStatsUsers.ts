import expressAsyncHandler from 'express-async-handler';
import { DEFAULT_USER } from '../../config/other';
import User from '../../models/userModel';
import { getUsersProjects, UserExtendedProjects } from '../../util/getUsersProjects';

// @route GET /api/stats/admin/users
// @access Protected Admin
export const getStatsUsers = expressAsyncHandler(async (req, res) => {
  try {
    const users = (await User.find({ isEngineer: false, isAdmin: false })
      .lean()
      .select('-password -secret -socketId -__v -createdAt -updatedAt')
      .populate('projects.atsakingas.project', '_id pavadinimas  pradzia pabaiga atsakingas')
      .populate('projects.dirba.project', 'pavadinimas pradzia pabaiga atsakingas dirba')
      .populate('projects.engineer.project', 'pavadinimas pradzia pabaiga dalys')) as UserExtendedProjects[];

    const cleanedUsers = users.map((user) => {
      return {
        _id: user._id,
        userName: user.userName,
        projects: getUsersProjects(user),
        // @ts-ignore
        papildomiDarbai: user.papildomiDarbai
      };
    });

    res.status(200).json({ data: cleanedUsers.filter((el) => el.userName !== DEFAULT_USER) });
  } catch (error: any) {
    res.status(500);
    throw new Error(error.message);
  }
});
