import jwt from 'jsonwebtoken';
import { NextFunction, Response } from "express";
import DataStoredInToken from 'interfaces/dataStoredInToken';
import userModel from '../users/user.model';
import RequestWithUser from 'interfaces/requestWithUser.interface';
import WrongAuthenticationTokenException from '../exceptions/WrongAuthenticationTokenException';
import AuthenticationTokenMissingException from '../exceptions/AuthenticationTokenMissingException';

async function authMiddleware(req: RequestWithUser, res: Response, next: NextFunction) {
  const cookies = req.cookies;
  if (cookies && cookies.Authorization) {
    const secret = process.env.JWT_SECRET;
    try {
      const verificationResponse = jwt.verify(cookies.Authorization, secret) as DataStoredInToken;
      const _id = verificationResponse._id;
      const user = await userModel.findById(_id);
      if (user) {
        req.user = user;
        next();
      } else {
        next(new WrongAuthenticationTokenException());
      }
    } catch (error) {
      next(new WrongAuthenticationTokenException());
    }
  } else {
    next(new AuthenticationTokenMissingException);
  }
}

export default authMiddleware;
