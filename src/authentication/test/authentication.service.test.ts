import * as typeorm from 'typeorm';
import CreateUserDto from '../../user/user.dto';
import TokenData from '../../interfaces/tokenData.interface';
import AuthenticatonService from '../authentication.service';
import UserWithThatEmailAlreadyExistsException from '../../exceptions/UserWithThatEmailAlreadyExistsException';

(typeorm as any).getRepository = jest.fn();

describe('The AuthenticationSerivie', () => {
  describe('when creating a cookie', () => {
    it('Should return a string', () => {
      const tokenData: TokenData = {
        token: '',
        expiresIn: 1,
      };
      (typeorm as any).getRepository.mockReturnValue({});
      const authenticationService = new AuthenticatonService();
      expect(typeof authenticationService.createCookie(tokenData)).toEqual('string');
    });
  });
  describe('when registering a user', () => {
    describe('if the email is already taken', () => {
      it('should throw an error', ()  => {
        const userData: CreateUserDto = {
          fullName: 'Trung DG',
          email: 'trungdi@test.com',
          password: 'Trung123!@#',
        };
        (typeorm as any).getRepository.mockReturnValue({
          findOne: () => Promise.resolve(userData),
        });
        const authenticationService = new AuthenticatonService();
        expect(authenticationService.register(userData))
          .rejects.toMatchObject(new UserWithThatEmailAlreadyExistsException(userData.email));
      });
    });
    describe('it the email is not taken', () => {
      it('should not throw an error', async () => {
        const userData: CreateUserDto = {
          fullName: 'Trung DG',
          email: 'trungdi@test.com',
          password: 'Trung123!@#',
        };
        process.env.JWT_SECRET = 'jwt_secret';
        (typeorm as any).getRepository.mockReturnValue({
          findOne: () => Promise.resolve(undefined),
          create: () => ({
            ...userData,
            id: 0,
          }),
          save: () => Promise.resolve(),
        });
        const authenticationService = new AuthenticatonService();
        await expect(authenticationService.register(userData))
          .resolves.toBeDefined();
      });
    });

  });
});
