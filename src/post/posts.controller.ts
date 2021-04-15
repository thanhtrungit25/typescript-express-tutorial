import express, { NextFunction, Request, Response } from 'express';
import PostNotFoundException from '../exceptions/PostNotFoundException';
import validationMiddleware from '../middleware/validation.middleware';
import Controller from '../interfaces/controller.interface';
import RequestWithUser from '../interfaces/requestWithUser.interface';
import authMiddleware from '../middleware/auth.middleware';
import CreatePostDto from './post.dto';
import { getRepository } from 'typeorm';
import Post from './post.entity';

class PostsController implements Controller {
  public path = '/posts';
  public router = express.Router();
  private postRepository = getRepository(Post);

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(this.path, this.getAllPosts);
    this.router.get(`${this.path}/:id`, this.getPostById);

    this.router
      .patch(`${this.path}/:id`, this.modifyPost)
      .delete(`${this.path}/:id`, this.deletePost)
      .post(this.path, authMiddleware, validationMiddleware(CreatePostDto), this.createPost);
  }

  private getAllPosts = async (req: Request, res: Response) => {
    const posts = await this.postRepository.find({ relations: ['categories'] });
    res.send(posts);
  }

  private createPost = async (req: RequestWithUser, res: Response) => {
    const postData: CreatePostDto = req.body;
    const newPost = this.postRepository.create({
      ...postData,
      author: req.user,
    });
    await this.postRepository.save(newPost);
    newPost.author = undefined;
    res.send(newPost);
  }

  private getPostById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const post = await this.postRepository.findOne(id, { relations:  ['categories'] });
    if (post) {
      res.send(post);
    } else {
      next(new PostNotFoundException(id));
    }
  }

  private modifyPost = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const postData: Post = req.body;
    await this.postRepository.update(id, postData);
    const updatedPost = await this.postRepository.findOne(id);
    if (updatedPost) {
      res.send(updatedPost);
    } else {
      next(new PostNotFoundException(id));
    }
  }

  private deletePost = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const deleteReponse = await this.postRepository.delete(id);
    console.log(deleteReponse);
    if (deleteReponse.affected) {
      res.sendStatus(200);
    } else {
      next(new PostNotFoundException(id));
    }
  }
}

export default PostsController;
