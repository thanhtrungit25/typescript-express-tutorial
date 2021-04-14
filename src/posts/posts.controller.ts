import express, { NextFunction, Request, Response } from 'express';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import authMiddleware from '../middleware/auth.middleware';
import Controller from '../interfaces/controller.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import Post from './post.interface';
import CreatePostDto from './post.dto';
import postModel from './post.model';

class PostsController implements Controller {
  public path = '/posts';
  public router = express.Router();
  private post = postModel;

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);

    this.router
      .all(`${this.path}/*`, authMiddleware)
      .patch(`${this.path}/:id`, validationMiddleware(CreatePostDto, true), this.modifyPost)
      .delete(`${this.path}/:id`, this.deletePost)
      .post(this.path, authMiddleware, validationMiddleware(CreatePostDto), this.createPost);
  }

  private getAllPosts = async (req: Request, res: Response) => {
    const posts = await this.post.find().populate('author', '-password');
    res.send(posts);
  }

  private createPost = async (req: RequestWithUser, res: Response) => {
   const postData: CreatePostDto = req.body;
   const createdPost = new this.post({
     ...postData,
     author: req.user._id,
   });
   const savedPost = await createdPost.save();
   await savedPost.populate('author', '-password').execPopulate();
   res.send(savedPost);
  }

  private getPostById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    try {
      const post = await this.post.findOne({ _id: id })
      if (post) {
        res.send(post);
      } else {
        next(new PostNotFoundException(id))
      }  
    } catch (err) {
      next(err)
    }
  }

  private modifyPost = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const postData: Post = req.body;
    const post = await this.post.findByIdAndUpdate(id, postData, { new: true })
    if (post) {
      res.send(post);
    } else {
      next(new PostNotFoundException(id))
    }  
  }

  private deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const post = await this.post.findByIdAndDelete(id)
    if (post) {
      res.send(post);
    } else {
      next(new PostNotFoundException(id))
    }  
  }
}

export default PostsController;
