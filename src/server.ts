import 'dotenv/config';
import App from './app';
import PostsController from './posts/posts.controller';
import UsersController from './users/user.controller';
import AuthenticationController from './authentication/authentication.controller';
import ReportsController from './reports/reports.controller';

const app = new App(
  [
    new PostsController(),
    new UsersController(),
    new ReportsController(),
    new AuthenticationController(),
  ]
);

app.listen();
