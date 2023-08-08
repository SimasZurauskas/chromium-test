import asynchandler from 'express-async-handler';
import User, { returnUserData } from '../models/userModel';
import { generate } from '../util/bcrypt';
import crypto from 'crypto';
import { notificationsIO } from '../sockets/notifications/notifications';
import { BeNotification, TransportType } from '../types';
import emitFormat from '../sockets/emitFormat';
import Project from '../models/projectModel';
import { sortBy } from 'lodash';
import { getUsersProjects, UserExtendedProjects } from '../util/getUsersProjects';
import { customError } from '../util/customError';
import { DEFAULT_USER } from '../config/other';

interface UserBody {
  userName: string;
  password: string;
  permission: 'admin' | 'office' | 'engineer';
  papildomiDarbai: { valandinis: number; darbai: { valandos: number; pavadinimas: string }[] };
}

// ------------------------------------------------------------------
// @route POST /api/user/admin
// @access Protected Admin
const createUser = asynchandler(async (req, res) => {
  const { userName, password, permission, papildomiDarbai } = req.body as UserBody;

  const userExists = await User.findOne({
    userName
  });

  if (userExists) {
    res.status(400);
    throw customError({ message: 'Naudotojas jau egzistuoja' });
  }

  const hashedPassword = await generate(password);
  const secret = crypto.randomUUID();

  await User.create({
    userName,
    isAdmin: permission === 'admin',
    isOffice: permission === 'office',
    isEngineer: permission === 'engineer',
    papildomiDarbai,
    password: hashedPassword,
    secret
  });

  res.sendStatus(201);
});

// ------------------------------------------------------------------
// @route GET /api/user/admin
// @access Protected Admin
const getUsers = asynchandler(async (req, res) => {
  try {
    const users = (await User.find({})
      .lean()
      .select('-password -secret -socketId -__v -createdAt -updatedAt')
      .populate('projects.atsakingas.project', '_id pavadinimas  pradzia pabaiga atsakingas')
      .populate('projects.dirba.project', 'pavadinimas pradzia pabaiga atsakingas dirba')
      .populate('projects.engineer.project', 'pavadinimas pradzia pabaiga dalys')
      .populate('payments.atsakingas.project', 'pavadinimas')
      .populate('payments.dirba.project', 'pavadinimas')) as UserExtendedProjects[];

    const mappedUsers = users.map((user) => {
      const datesArr: any[] = [];
      user.projects.atsakingas.forEach((el: any) => {
        el.project?.pabaiga && datesArr.push(el.project.pabaiga);
      });
      user.projects.dirba.forEach((el: any) => {
        el.project?.pabaiga && datesArr.push(el.project.pabaiga);
      });
      user.projects.engineer.forEach((el: any) => {
        el.project?.pabaiga && datesArr.push(el.project.pabaiga);
      });

      const uzimtumas = sortBy(datesArr, (date) => -Date.parse(date))[0] || null;

      return {
        // @ts-ignore
        ...returnUserData(user),
        uzimtumas,
        projects: getUsersProjects(user)
      };
    });

    res.status(200).json({ data: mappedUsers.filter((el) => el.userName !== DEFAULT_USER) });
  } catch (error: any) {
    res.status(500);
    throw customError({ error });
  }
});

// ------------------------------------------------------------------
// @route GET /api/user/admin/:id
// @access Protected Admin
const getUser = asynchandler(async (req, res) => {
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
      throw customError({ message: 'Bad request' });
    }

    const parsedUser = {
      ...user,
      projects: getUsersProjects(user)
    };

    res.status(200).json({ data: parsedUser });
  } catch (error: any) {
    res.status(500);
    throw customError({ error });
  }
});

// ------------------------------------------------------------------
// @route PUT /api/user/admin/:id
// @access Protected Admin
const updateUser = asynchandler(async (req, res) => {
  const id = req.params.id;
  const { userName, password, permission, papildomiDarbai } = req.body as UserBody;

  const user = await User.findById(id);
  if (!user) {
    res.status(400);
    throw customError({ message: 'Bad request' });
  }

  try {
    user.userName = userName;
    user.isAdmin = permission === 'admin';
    user.isOffice = permission === 'office';
    user.isEngineer = permission === 'engineer';
    user.papildomiDarbai.valandinis = papildomiDarbai.valandinis;
    user.papildomiDarbai.darbai = papildomiDarbai.darbai;

    notificationsIO.to(user.socketId).emit(
      'default',
      emitFormat<BeNotification>(TransportType.BeNotification, {
        title: 'Title!',
        text: 'Pranesimo tekstas'
      })
    );

    if (password) {
      const hashedPassword = await generate(password);
      const secret = crypto.randomUUID();

      user.password = hashedPassword;
      user.secret = secret;
    }

    await user.save();

    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw customError({ error });
  }
});

// ------------------------------------------------------------------
// @route DELETE /api/user/admin/:id
// @access Protected Admin
const deleteUser = asynchandler(async (req, res) => {
  const id = req.params.id;

  try {
    await Project.updateMany({ 'atsakingas.user': id }, { 'atsakingas.user': null });
    await Project.updateMany({ 'dirba.user': id }, { $pull: { dirba: { user: id } } });

    await User.findByIdAndDelete(id);

    res.sendStatus(204);
  } catch (error: any) {
    res.status(500);
    throw customError({ error });
  }
});

export { createUser, getUsers, getUser, updateUser, deleteUser };
