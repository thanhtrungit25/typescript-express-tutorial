import express, { NextFunction, Request, Response } from 'express';
import { getRepository } from 'typeorm';
import Controller from '../interfaces/controller.interface';
import validationMiddleware from '../middleware/validation.middleware';
import CreateCategoryDto from './category.dto';
import CategoryNotFoundException from '../exceptions/CategoryNotFoundException';
import Category from './category.entity';

class CategoryController implements Controller {
  public path = '/categories';
  public router = express.Router();
  private categoryRepository = getRepository(Category);

  constructor() {
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get(this.path, this.getAllCategories);
    this.router.get(`${this.path}/:id`, this.getCategoryById);
    this.router.post(this.path, validationMiddleware(CreateCategoryDto), this.createRepository);
  }

  private getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const category = await this.categoryRepository.findOne(id, { relations: ['posts'] });
    if (category) {
      res.send(category);
    } else {
      next(new CategoryNotFoundException(id));
    }
  }

  private getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    const categories = await this.categoryRepository.find({ relations: ['posts'] });
    res.send(categories);
  }

  private createRepository = async (req: Request, res: Response, next: NextFunction) => {
    const categoryData: CreateCategoryDto = req.body;
    const newCategory = this.categoryRepository.create(categoryData);
    await this.categoryRepository.save(newCategory);
    res.send(newCategory);
  }
}

export default CategoryController;
