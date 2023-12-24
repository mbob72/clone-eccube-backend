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
import { JwtAuthGuard } from './guards/jwtAuth.guard';
import { ILoginUserResponse } from './types';
import { RefreshJwtGuard } from './guards/refreshAuth.guard';

@Controller('/v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookiesService: CookiesService,
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
