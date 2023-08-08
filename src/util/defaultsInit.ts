import User from '../models/userModel';
import { generate } from './bcrypt';
import crypto from 'crypto';
import { DEFAULT_USER } from '../config/other';

const defaultsInit = async () => {
  const adminExists = await User.findOne({ isAdmin: true });

  if (!adminExists) {
    try {
      const hashedPassword = await generate('admin');
      const secret = crypto.randomUUID();

      await User.create({
        userName: 'admin',
        isAdmin: true,
        isOffice: false,
        isEngineer: false,
        password: hashedPassword,
        secret
      });
    } catch (error) {
      console.log('Admin init', error);
    }
  }

  const defaultUserExists = await User.findOne({ userName: DEFAULT_USER });

  if (!defaultUserExists) {
    try {
      const hashedPassword = await generate(DEFAULT_USER);
      const secret = crypto.randomUUID();

      await User.create({
        userName: DEFAULT_USER,
        isAdmin: false,
        isOffice: true,
        isEngineer: true,
        password: hashedPassword,
        secret
      });
    } catch (error) {
      console.log('Default user init', error);
    }
  }
};

export default defaultsInit;
