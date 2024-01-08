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

  protected async getJwtTokens(userId: string): Promise<{
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
      accessToken: this.tokenService.createToken(user.id),
      refreshToken: this.tokenService.createRefreshToken(user.id),
      expiresIn, // new Date().setTime(new Date().getTime() + ACCESS_TOKEN_EXPIRE_TIME_MS),
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
    const backendTokens = await this.getJwtTokens(user.id);
    await this.updateRefreshToken(user.id, backendTokens.refreshToken);
    return { user, backendTokens };
  }

  async isLoggedInUser(userId: string): Promise<{
    user: Nullable<User>;
    backendTokens: Nullable<ILoginUserResponse['backendTokens']>;
  }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const backendTokens = await this.getJwtTokens(user.id);
    return { user, backendTokens };
  }

  protected async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken =
      await this.cryptService.generateHash(refreshToken);
    await this.usersService.updateRefreshToken(userId, hashedRefreshToken);
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

  async activateUser(userId: string): Promise<User> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.usersService.update(userId, {
      isActive: true,
      isVerified: true,
    });
  }

  async updatePassword(userId: string, plainPassword: string): Promise<void> {
    const hashedPassword = await this.cryptService.generateHash(plainPassword);
    await this.usersService.updatePassword(userId, hashedPassword);
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
