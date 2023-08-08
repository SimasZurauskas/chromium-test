import asynchandler from 'express-async-handler';
import { DEFAULT_USER } from '../config/other';
import User from '../models/userModel';

// ------------------------------------------------------------------
// @route GET /api/misc/options/users
// @access Protected
const getUsersOptions = asynchandler(async (req, res) => {
  const users = await User.find({ isOffice: true });

  res.status(200).json({
    data: users.map((el) => {
      return { label: el.userName, value: el._id };
    })
  });
});

// ------------------------------------------------------------------
// @route GET /api/misc/options/users
// @access Protected
const getEngineersOptions = asynchandler(async (req, res) => {
  const users = await User.find({ isEngineer: true });

  res.status(200).json({
    data: users.map((el) => {
      return { label: el.userName, value: el._id };
    })
  });
});

// ------------------------------------------------------------------
// @route GET /api/misc/options/non-admin
// @access Protected
const getNonAdminOptions = asynchandler(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    data: users
      .filter((el) => !el.isAdmin && el.userName !== DEFAULT_USER)
      .map((el) => {
        return { label: el.userName, value: el._id };
      })
  });
});

export { getUsersOptions, getEngineersOptions, getNonAdminOptions };
