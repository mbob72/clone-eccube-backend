import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthorizationCode, ModuleOptions } from 'simple-oauth2';
import { MollieService } from './mollie.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserId } from 'src/auth/decorators/userId.decorator';
import { generateAuthorizeUrlState } from './lib';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateMollieProfileDto } from './dto/create-mollie-profile.dto';
import { UpdateMollieProfileDto } from './dto/update-mollie-profile.dto';

export interface ITokenRes {
  token: {
    access_token: string;
    expires_in: number; // 3600
    token_type: string; // bearer
    scope: string;
    refresh_token: string;
    expires_at: string;
  };
}

// !important - root path
// TODO: remove @Public() decorator next time
@Controller('/mollie')
export class MollieController {
  private readonly callbackUrl = 'https://bidding.eccube.de/callback';
  private config: ModuleOptions;
  private client: AuthorizationCode;

  constructor(
    private readonly mollieService: MollieService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {
    this.config = {
      client: {
        id: this.configService.get('mollie.clientId')!,
        secret: this.configService.get('mollie.clientSecret')!,
      },
      auth: {
        authorizeHost: this.configService.get('mollie.authHost')!,
        authorizePath: '/oauth2/authorize',
        tokenHost: this.configService.get('mollie.tokenHost')!,
        tokenPath: '/oauth2/tokens',
      },
    };
    this.client = new AuthorizationCode(this.config);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/auth/url')
  create(@Req() req: Request, @Res() res: Response) {
    const authorizationUri = this.client.authorizeURL({
      redirect_uri: this.callbackUrl,
      // scope: ['payments.write', 'refunds.write'],
      scope: [
        'payments.write',
        'payments.read',
        'refunds.write',
        'organizations.read',
        'organizations.write',
      ],
      state: generateAuthorizeUrlState(), // '3(#0/!~',
    });
    // res.redirect(authorizationUri);
    return res.status(200).json({ authorizationUri });
  }

  // Callback service parsing the authorization token and asking for the access token
  @UseGuards(JwtAuthGuard)
  @Get('/auth/token')
  async callback(
    @UserId() userId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { code } = req.query;
    if (!code) {
      return res
        .status(400)
        .json({ message: 'Authorization code must be provided' });
    }
    const tokenParams = {
      code: code as string,
      redirect_uri: this.callbackUrl,
      grant_type: 'authorization_code',
    };
    try {
      const data = (await this.client.getToken(
        tokenParams,
      )) as unknown as ITokenRes;
      const accessToken = data?.token?.access_token;
      if (!accessToken) {
        return res.status(400).json({ message: 'Auth error' });
      }
      // TODO: update access-token on cookies
      // TODO: add refresh token logic
      // TODO: hash access-token in the DB
      console.log("Mollie's access-token:: ", accessToken);
      this.usersService.saveMollieAccessToken(userId, accessToken);
      this.usersService.setOnboardingState(userId, true);
      const userInfo = this.jwtService.decode(accessToken);
      console.log("userInfo from Mollie's access-token:: ", userInfo);
    } catch (error) {
      console.log('Access Token Error::', error.message);
    }
  }

  // Just for testing
  // TODO: delete
  @Public()
  @Get('/login')
  login(@Req() req: Request, @Res() res: Response) {
    res.send('Hello<br><a href="/auth">Log in with Mollie</a>');
  }

  // *
  // * Mollie API - profile CRUD
  // */

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/create/profile')
  async createProfile(
    @UserId() userId: string,
    @Body() createProfileDto: CreateMollieProfileDto,
  ) {
    const data = await this.mollieService.createMollieProfile(
      userId,
      createProfileDto,
    );
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/update/profile')
  async updateProfile(
    @UserId() userId: string,
    @Body() updateProfileDto: UpdateMollieProfileDto,
  ) {
    const data = await this.mollieService.updateMollieProfile(
      userId,
      updateProfileDto,
    );
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/get/profile')
  async getProfile(@UserId() userId: string) {
    const data = await this.mollieService.getMollieProfile(userId);
    return data;
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('/delete/profiles')
  async deleteProfiles(@UserId() userId: string) {
    const data = await this.mollieService.deleteMollieProfile(userId);
    return data;
  }
}
