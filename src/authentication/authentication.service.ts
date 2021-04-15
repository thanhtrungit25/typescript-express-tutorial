import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { getRepository } from 'typeorm';
import CreateUserDto from '../users/user.dto';
import User from '../users/user.entity';
import UserWithThatEmailAlreadyExistsException from '../exceptions/UserWithThatEmailAlreadyExistsException';
import TokenData from '../interfaces/tokenData.interface';
import DataStoredInToken from '../interfaces/dataStoredInToken';

class AuthenticationService {
  private UserRepository = getRepository(User);

  public async register(userData: CreateUserDto) {
    if (
      await this.UserRepository.findOne({ email: userData.email })
    ) {
      throw new UserWithThatEmailAlreadyExistsException(userData.email);
    }
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.UserRepository.create({
      ...userData,
      password: hashedPassword,
    });
    await this.UserRepository.save(user);

    user.password = undefined;
    const tokenData = this.createToken(user);
    const cookie = this.createCookie(tokenData);
    return {
      cookie,
      user,
    };
  }

  public createToken(user: User): TokenData {
    const expiresIn = 60 * 60; // an hour
    const secret = process.env.JWT_SECRET;
    const DataStoredInToken: DataStoredInToken = {
      id: user.id,
    };
    return {
      expiresIn,
      token: jwt.sign(DataStoredInToken, secret, { expiresIn }),
    }
  }

  public createCookie(tokenData: TokenData) {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn}`
  }
}

export default AuthenticationService;
