import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  HttpCode,
  Get,
  UseInterceptors,
  Req,
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
import { TransformInterceptor } from 'src/libs/TransformInterceptor';

@Controller('/v1/auth')
@UseInterceptors(TransformInterceptor)
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
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    user: Nullable<User>;
    backendTokens: Nullable<ILoginUserResponse['backendTokens']>;
  }> {
    if (!userId) {
      this.cookiesService.removeTokenInCookies(res);
      return { user: null, backendTokens: null };
    }
    const data = await this.authService.isLoggedInUser(userId);
    return data;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtGuard)
  @Post('/refresh')
  async refreshToken(
    @UserId() userId: string, // extract userId from JwtStrategy `validate` method
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ILoginUserResponse['backendTokens']> {
    const plainRefreshToken = this.extractRefreshJwtTokenFromHeader(req);
    const data = await this.authService.refreshToken(
      userId,
      plainRefreshToken!,
    );
    this.cookiesService.writeTokenInCookies(res, data.accessToken);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logoutUser(@Res({ passthrough: true }) res: Response): Promise<void> {
    this.cookiesService.removeTokenInCookies(res);
  }

  private extractRefreshJwtTokenFromHeader(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const [type, token] = authHeader?.split(' ') || [];
    if (type !== 'Refresh' || !token) return null;
    return token;
  }
}
