import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { CookiesService } from './lib/cookies.service';
import { UserId } from './decorators/userId.decorator';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { Public } from './decorators/public.decorator';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Controller('/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: CookiesService,
    private readonly userService: UsersService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/register')
  async registerUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ id: string }> {
    const user = await this.authService.registerUser(createUserDto);
    return { id: user.id };
  }

  // temporary solution
  // TODO: should work via confirmation email
  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/activate')
  async activateUser(@Body() payload: { token: string }): Promise<User> {
    const user = await this.authService.activateUser(payload.token);
    return user;
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async loginUser(
    @UserId() userId: string, // extract userId from LocalStrategy `validate` method
    @Res({ passthrough: true }) res: Response,
  ): Promise<User> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    // const userRestriction =
    //   await this.restrictionService.getUserRestriction(userId);
    // if (userRestriction === USER_RESTRICTION_LOGIN_BLOCK) {
    //   throw new ForbiddenException();
    // }
    const token = await this.authService.getJwtToken(userId);
    this.cookiesService.writeTokenInCookies(res, token);
    return user;
  }

  @Post('/logout')
  async logoutUser(@Res({ passthrough: true }) res: Response): Promise<void> {
    this.cookiesService.removeTokenInCookies(res);
  }
}
