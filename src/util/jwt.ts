import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';

type UserTokenPayload = {
  id: string;
  secret: string;
  iat: number;
  exp: number;
};

export const generateToken = (id: string | Types.ObjectId, secret: string) => {
  return jwt.sign({ id, secret }, process.env.JWT_SECRET as string, {
    expiresIn: '1000d'
  });
};

export const decodeToken = (token: string) => {
  if (!token) {
    return undefined;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as UserTokenPayload;

    return decoded;
  } catch (error) {
    return undefined;
  }
};
