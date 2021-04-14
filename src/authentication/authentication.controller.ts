import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Controller from "../interfaces/controller.interface";
import validationMiddleware from '../middleware/validation.middleware';
import CreateUserDto from '../users/user.dto';
import LogInDto from '../users/login.dto';
import WrongCredentialException from '../exceptions/WrongCredentialException';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import TokenData from '../interfaces/tokenData.interface'
import DataStoredInToken from '../interfaces/dataStoredInToken';
import User from '../users/user.entity';
import { getRepository } from 'typeorm';
class AuthenticationController implements Controller {
  public path = '/auth';
  public router = express.Router();
  private UserRepository = getRepository(User);
  
  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post(`${this.path}/register`, validationMiddleware(CreateUserDto), this.registration);
    this.router.post(`${this.path}/login`, validationMiddleware(LogInDto), this.loggingIn);
    this.router.post(`${this.path}/logout`, this.loggingOut);
  }

  private registration = async (req: Request, res: Response, next: NextFunction) => {
    const userData: CreateUserDto = req.body;
    if (
      await this.UserRepository.findOne({ email: userData.email })
    ) {
      next(new UserWithThatEmailAlreadyExistsException(userData.email))
    } else {
      try {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const user = this.UserRepository.create({
          ...userData,
          password: hashedPassword,
        });
        await this.UserRepository.save(user);

        user.password = undefined;
        const tokenData = this.createToken(user);
        res.setHeader('Set-Cookie', [this.createCookie(tokenData)])
        res.send(user);
      } catch (error) {
        console.log(error.message);
      }
    }
  }

  private loggingIn = async (req: Request, res: Response, next: NextFunction) => {
    const logInData: LogInDto = req.body;
    const user = await this.UserRepository.findOne({ email: logInData.email });
    if (!user) {
      next(new WrongCredentialException())
    }
    try {
      const isPasswordMatching = await bcrypt.compare(
        logInData.password,
        user.password
      );
      console.log('isPasswordMatching', isPasswordMatching);
      if (isPasswordMatching) {
        const tokenData = this.createToken(user);
        user.password = undefined;
        res.setHeader('Set-Cookie', [this.createCookie(tokenData)])
        res.send(user);
      } else {
        next(new WrongCredentialException())
      }
    } catch (error) {
      console.log(error.message);
      next(new WrongCredentialException())
    }
  }

  private loggingOut = async (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Set-Cookie', ['Authorization=;Max-Age=0'])
    res.send(200);
  }

  private createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const DataStoredInToken: DataStoredInToken = {
      id: user.id,
    };
    return {
      expiresIn,
      token: jwt.sign(DataStoredInToken, secret, { expiresIn }),
    }
  }

  private createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`
  }
}

export default AuthenticationController;
