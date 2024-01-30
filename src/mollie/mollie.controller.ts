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
import { UserId } from 'src/auth/decorators/userId.decorator';
import { generateAuthorizeUrlState } from './lib';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { CreateMollieProfileDto } from './dto/createMollieProfile.dto';
import { UpdateMollieProfileDto } from './dto/updateMollieProfile.dto';
import { OrganizationsService } from 'src/organizations/organizations.service';
import { pick } from 'radash';

export interface ITokenRes {
  token: {
    access_token: string;
    expires_in: number; // 3600
    token_type: string; // bearer
    scope: string;
    refresh_token: string;
    expires_at: string; // date
  };
}

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
    private readonly organizationsService: OrganizationsService,
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
  @HttpCode(HttpStatus.OK)
  @Get('/auth/url')
  create() {
    const authorizationUri = this.client.authorizeURL({
      redirect_uri: this.callbackUrl,
      // TODO: update permissions
      // https://docs.mollie.com/connect/permissions
      scope: [
        'payments.write',
        'payments.read',
        'refunds.write',
        'organizations.read',
        'organizations.write',
        'profiles.read',
        'profiles.write',
        'customers.read',
        'customers.write',
        'invoices.read',
        'orders.read',
        'orders.write',
        'payment-links.read',
        'payment-links.write',
      ],
      state: generateAuthorizeUrlState(), // '3(#0/!~',
    });
    return { authorizationUri };
  }

  // Callback service parsing the authorization token and asking for the access token
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/auth/token')
  async callback(
    @UserId() userId: string,
    @Body() body: { code: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { code } = body;
    if (!code) {
      return res
        .status(400)
        .json({ message: 'Authorization code must be provided' });
    }

    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const tokenParams = {
      code: code as string,
      redirect_uri: this.callbackUrl,
      grant_type: 'authorization_code',
    };

    const data = (await this.client.getToken(
      tokenParams,
    )) as unknown as ITokenRes;
    const accessToken = data?.token?.access_token;
    const refreshToken = data?.token?.refresh_token;
    const expiresAt = data?.token?.expires_at;
    if (!accessToken || !refreshToken) {
      return res.status(400).json({ message: 'Auth error' });
    }
    // TODO: update access-token on cookies
    // TODO: add refresh token logic
    // TODO: hash access-token in the DB
    console.log("Mollie's data:: ", data);

    user.mollieAccessToken = accessToken;
    user.mollieRefreshToken = refreshToken;
    user.mollieAccessTokenExpiresAt = expiresAt;
    user.isKybPassed = true;
    await this.usersService.save(user);

    return res.status(200).json({ accessToken });
  }

  // *
  // * Mollie API - profile CRUD
  // */

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/create/profile')
  async createProfile(@UserId() userId: string) {
    const user = await this.usersService.findByIdWithOrganization(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { organization } = user;
    if (!organization) {
      throw new Error('Organization not found');
    }
    const createProfileDto: CreateMollieProfileDto = pick(
      // TODO: `businessCategory` !!!!!
      { ...organization, businessCategory: 'OTHER_MERCHANDISE' },
      ['name', 'email', 'phone', 'website', 'businessCategory', 'mode'],
    );
    const profile = await this.mollieService.createMollieProfile(
      userId,
      createProfileDto,
    );
    console.log('profile:: ', profile);
    return profile;
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
  @Get('/delete/profile')
  async deleteProfiles(@UserId() userId: string) {
    const data = await this.mollieService.deleteMollieProfile(userId);
    return data;
  }
}
