import HttpException from './HttpException';

class WrongCredentialException extends HttpException {
  constructor() {
    super(401, 'Wrong credentials provied');
  }
}

export default WrongCredentialException;
