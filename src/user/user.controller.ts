import express, { NextFunction, Request, Response } from 'express';
import NotAuthorizedException from '../exceptions/NotAuthorizedException';
import UserNotFoundException from '../exceptions/UserNotFoundException';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import Controller from '../interfaces/controller.interface';
import postModel from '../post/post.model';
import userModel from './user.model';
import authMiddleware from '../middleware/auth.middleware';

class UsersController implements Controller {
  public path = '/users';
  public router = express.Router();
  private post = postModel;
  private user = userModel;

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(`${this.path}/:id`, authMiddleware, this.getUserById);
    this.router.get(`${this.path}/:id/posts`, authMiddleware, this.getAllPostsOfUser);
  }

  private getUserById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const userQuery = this.user.findById(id);

    if (req.query.withPosts === 'true') {
      userQuery.populate('posts').exec();
    }

    const user = await userQuery;
    if (user) {
      res.send(user);
    } else {
      next(new UserNotFoundException(id));
    }
  }

  private getAllPostsOfUser = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    console.log('req.user', req.user);
    const userId = req.params.id;
    if (userId === req.user.id.toString()) {
      const posts = await this.post.find({ author: userId });
      res.send(posts);
    }
    next(new NotAuthorizedException());
  }
}

export default UsersController;
