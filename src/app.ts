import 'reflect-metadata';
import express from "express";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import Controller from "./interfaces/controller.interface";
import errorMiddleware from "./middleware/error.middleware";

class App {
  public app: express.Application;
  public port: number;

  constructor(controllers: Controller[]) {
    this.app = express();

    this.connectToTheDatabase();
    this.initializeMiddlewares();
    this.initializeControllers(controllers);
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    this.app.use(bodyParser.json());
    this.app.use(cookieParser());
  }

  private initializeControllers(controllers) {
    controllers.forEach(controller => {
      this.app.use('/', controller.router);
    });
  }

  private initializeErrorHandling() {
    this.app.use(errorMiddleware);
  }

  public listen() {
    this.app.listen(process.env.PORT, function() {
      console.log(`App listening on the port ${process.env.PORT}`);
    })
  }

  private async connectToTheDatabase() {
    await mongoose.connect(process.env.MONGO_PATH, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
  }
}

export default App;