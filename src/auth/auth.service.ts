import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Nullable } from 'src/types/utils';
import { CryptService } from './lib/crypt.service';
import { TokenService } from './lib/token.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { ILoginUserResponse } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly cryptService: CryptService,
    private readonly tokenService: TokenService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Nullable<User>> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return null;
    }
    const isValid = await this.isPasswordValid(email, pass);
    if (isValid) {
      return user;
    }
    return null;
  }

  protected async createJwtTokens(userId: string): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // if (user.restriction === USER_RESTRICTION_FULL) {
    //   throw new AccessForbiddenError('You cannot login right now.');
    // }
    const accessToken = this.tokenService.createToken(user.id);
    const expiresIn = this.tokenService.extractExpirationDate(accessToken);
    return {
      accessToken,
      refreshToken: this.tokenService.createRefreshToken(user.id),
      expiresIn,
    };
  }

  async registerUser(createDto: CreateUserDto): Promise<User> {
    // TODO: check email + blacklist
    // await this.checkEmail(email);
    let user = await this.usersService.findByEmail(createDto.email);
    //   if (user && user.isActive) {
    //     throw new AccessForbiddenError('Unexpected error in registerUser');
    //   }
    const plainPassword = createDto.password;
    const passwordHash = await this.cryptService.generateHash(plainPassword);
    // if (user) {
    //   user = await this.usersService.activate(user.id, {...createDto, password: passwordHash});
    // } else {
    user = await this.usersService.create({
      ...createDto,
      password: passwordHash,
    });
    // }
    // this.eventEmitter.emit('user.new', user, origin);
    // TODO: send email
    return user;
  }

  async loginUser(email: string): Promise<ILoginUserResponse> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }
    // const userRestriction =
    //   await this.restrictionService.getUserRestriction(userId);
    // if (userRestriction === USER_RESTRICTION_LOGIN_BLOCK) {
    //   throw new ForbiddenException();
    // }
    const backendTokens = await this.createJwtTokens(user.id);
    await this.updateRefreshToken(user.id, backendTokens.refreshToken);
    return { user, backendTokens };
  }

  async isLoggedInUser(
    userId: string,
    accessToken: string,
  ): Promise<{
    user: User;
    backendTokens: ILoginUserResponse['backendTokens'];
  }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const refreshToken = this.tokenService.createRefreshToken(user.id);
    await this.updateRefreshToken(user.id, refreshToken);
    const backendTokens = {
      accessToken,
      refreshToken,
      expiresIn: this.tokenService.extractExpirationDate(accessToken),
    };
    return { user, backendTokens };
  }

  protected async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken =
      await this.cryptService.generateHash(refreshToken);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.refreshToken = hashedRefreshToken;
    return this.usersService.save(user);
  }

  async refreshToken(
    userId: string,
    plainRefreshToken: string,
  ): Promise<ILoginUserResponse['backendTokens']> {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    const refreshTokenMatches = await this.cryptService.verify(
      plainRefreshToken,
      user.refreshToken,
    );
    if (!refreshTokenMatches) {
      throw new ForbiddenException('Access Denied');
    }
    const data = await this.loginUser(user.email);
    const { backendTokens } = data;
    return backendTokens;
  }

  async verifyUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.isVerified = true;
    return this.usersService.save(user);
  }

  async updatePassword(userId: string, plainPassword: string): Promise<void> {
    const hashedPassword = await this.cryptService.generateHash(plainPassword);
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.password = hashedPassword;
    await this.usersService.save(user);
  }

  async logout(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    user.refreshToken = null;
    return this.usersService.save(user);
  }

  private async isPasswordValid(
    email: string,
    plainPass: string,
  ): Promise<boolean> {
    if (plainPass.length > 48) {
      return false;
    }
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return false;
    }
    const hashedPassword = user.password;
    return this.cryptService.verify(plainPass, hashedPassword);
  }
}
