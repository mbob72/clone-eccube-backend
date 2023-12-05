import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from 'src/users/entities/user.entity';
import { Nullable } from 'src/types/utils';
import { CryptService } from './lib/crypt.service';
import { TokenService } from './lib/token.service';
import { CreateUserDto } from 'src/users/dto/createUser.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private cryptService: CryptService,
    private tokenService: TokenService,
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

  async getJwtToken(userId: string): Promise<string> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // if (user.restriction === USER_RESTRICTION_FULL) {
    //   throw new AccessForbiddenError('You cannot login right now.');
    // }
    return this.tokenService.createToken(user.id);
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
