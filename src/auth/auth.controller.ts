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
import { RefreshJwtGuard } from './guards/refreshJwt.guard';
import Nullable from '@mollie/api-client/dist/types/src/types/Nullable';
import { ConfigService } from '@nestjs/config';
import { TransformInterceptor } from 'src/libs/TransformInterceptor';
import {
  extractJwtTokenFromRequest,
  extractRefreshTokenFromHeader,
} from './lib/utils';

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
    const user = await this.authService.verifyUser(payload.token);
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

  // update refresh-token to support security
  @UseGuards(JwtAuthGuard)
  @Get('/logged_in')
  async isLoggedInUser(
    @UserId() userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{
    user: Nullable<User>;
    backendTokens: Nullable<ILoginUserResponse['backendTokens']>;
  }> {
    const accessToken = extractJwtTokenFromRequest(req);
    if (!userId || !accessToken) {
      this.cookiesService.removeTokenInCookies(res);
      return { user: null, backendTokens: null };
    }
    const data = await this.authService.isLoggedInUser(userId, accessToken);
    return data;
  }

  @HttpCode(HttpStatus.OK)
  @UseGuards(RefreshJwtGuard)
  @Post('/refresh')
  async refreshToken(
    @UserId() userId: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ILoginUserResponse['backendTokens']> {
    // const plainRefreshToken = req.user['refreshToken'];
    const plainRefreshToken = extractRefreshTokenFromHeader(req);
    const data = await this.authService.refreshToken(
      userId,
      plainRefreshToken!,
    );
    this.cookiesService.writeTokenInCookies(res, data.accessToken);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @Post('/logout')
  async logoutUser(
    @UserId() userId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    this.cookiesService.removeTokenInCookies(res);
    this.authService.logout(userId);
  }
}
