import 'reflect-metadata';
import 'dotenv/config';
import App from './app';
import config from './ormconfig';
import { createConnection } from 'typeorm';

import PostsController from './post/posts.controller';
import CategoryController from './category/category.controller';
// import UsersController from './users/user.controller';
import AuthenticationController from './authentication/authentication.controller';
// import ReportsController from './reports/reports.controller';

// const app = new App(
//   [
//     new PostsController(),
//     new UsersController(),
//     new ReportsController(),
//     new AuthenticationController(),
//   ]
// );

// app.listen();

(async () => {
  try {
    const connection = await createConnection(config);
    await connection.runMigrations();
  } catch (error) {
    console.log('Error while connecting to the database', error);
    return error;
  }
  const app = new App(
    [
      new PostsController(),
      new AuthenticationController(),
      new CategoryController(),
    ],
  );
  app.listen();
})();
