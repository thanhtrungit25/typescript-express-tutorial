import express, { NextFunction, Request, Response } from 'express';
import Controller from '../interfaces/controller.interface';
import userModel from '../user/user.model';

class ReportsController implements Controller {
  public path = '/reports';
  public router = express.Router();
  private user = userModel;

  constructor() {
    this.initRoutes();
  }

  public initRoutes() {
    this.router.get(`${this.path}`, this.generateReport);
  }

  private generateReport = async (req: Request, res: Response, next: NextFunction) => {
    const usersByContries = await this.user.aggregate(
      [
        {
          $match: {
            'address.country': {
              $exists: true,
            },
          },
        },
        {
          $group: {
            _id: {
              country: '$address.country',
            },
            users: {
              $push: {
                _id: '$_id',
              },
            },
            count: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'users._id',
            foreignField: '_id',
            as: 'users',
          },
        },
      ],
    );

    res.send({
      usersByContries,
    });
  }
}

export default ReportsController;
