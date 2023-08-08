import { compare } from 'bcryptjs';
import asynchandler from 'express-async-handler';
import User, { MUser, returnUserData } from '../models/userModel';
import { customError } from '../util/customError';
import { generateToken } from '../util/jwt';

interface SignInBody {
  userName: string;
  password: string;
}

// ------------------------------------------------------------------
// @route POST /api/auth/signin
// @access Public
const signIn = asynchandler(async (req, res) => {
  const { userName, password } = req.body as SignInBody;

  const user = await User.findOne({
    userName: { $regex: `^${userName}$`, $options: 'i' }
  });

  if (!user) {
    res.status(400);
    throw customError({ message: 'Naudotojo nėra arba duomenys neteisingi' });
  }

  const passwordsMatch = await compare(password, user.password).catch(() => {});

  if (!passwordsMatch) {
    res.status(400);
    throw customError({ message: 'Naudotojo nėra arba duomenys neteisingi' });
  }

  res.json({
    user: returnUserData(user),
    token: generateToken(user._id, user.secret)
  });
});

// ------------------------------------------------------------------
// GET /api/auth/user
// @access Private
const getAuthUser = asynchandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId as string;

  const user = (await User.findById(userId)) as MUser;

  if (!user) {
    res.status(401);
    throw customError({ message: 'Unauthorized' });
  }

  res.status(200).json({ user: returnUserData(user) });
});

// ------------------------------------------------------------------
// GET /api/auth/refresh-token
// @access Private
const refreshToken = asynchandler(async (req, res) => {
  // @ts-ignore
  const userId = req.userId as string;

  const user = (await User.findById(userId)) as MUser;

  if (!user) {
    res.status(401);
    throw customError({ message: 'Unauthorized' });
  }

  res.status(200).send(generateToken(userId, user.secret));
});

export { signIn, getAuthUser, refreshToken };
