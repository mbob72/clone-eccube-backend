import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  HttpCode,
  Get,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/localAuth.guard';
import { CookiesService } from './lib/cookies.service';
import { UserId } from './decorators/userId.decorator';
import { CreateUserDto } from 'src/users/dto/createUser.dto';
import { Public } from './decorators/public.decorator';
import { User } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { ILoginUserResponse } from './types';
import { RefreshJwtGuard } from './guards/refreshAuth.guard';
import Nullable from '@mollie/api-client/dist/types/src/types/Nullable';
import { ConfigService } from '@nestjs/config';

@Controller('/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: CookiesService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
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

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async loginUser(
    @Body() payload: { email: string; password: string },
    @Res({ passthrough: true })
    res: Response,
  ): Promise<ILoginUserResponse> {
    const { email } = payload;
    const data = await this.authService.loginUser(email);
    const accessToken = data.backendTokens.accessToken;
    this.cookiesService.writeTokenInCookies(res, accessToken);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Get('/logged_in')
  async isLoggedInUser(
    @UserId() userId: string,
    req: Request,
    res: Response,
  ): Promise<Nullable<User>> {
    // const cookieName = this.configService.get<string>('COOKIE_NAME')!;
    // console.log('cookieName', cookieName);
    // const token = req.cookies[cookieName];
    // console.log('token', token);
    if (!userId) {
      this.cookiesService.removeTokenInCookies(res);
      return null;
    }
    const user = await this.authService.isLoggedInUser(userId);
    return user;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtGuard)
  @Post('/refresh')
  async refreshToken(
    @UserId() userId: string, // extract userId from JwtStrategy `validate` method
  ): Promise<ILoginUserResponse['backendTokens']> {
    const data = await this.authService.refreshToken(userId);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logoutUser(@Res({ passthrough: true }) res: Response): Promise<void> {
    this.cookiesService.removeTokenInCookies(res);
  }
}
