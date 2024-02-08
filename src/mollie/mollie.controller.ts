import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
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
import { UsersService } from 'src/users/users.service';
import { UpdateMollieProfileDto } from './dto/updateMollieProfile.dto';
import {
  IMollieListPaymentMethodsResponse,
  IMollieOnboardingStatusResponse,
  IMollieProfileEnabledPaymentMethodResponse,
  IMollieTokensResponse,
  MollieMethodQuery,
} from './types';

@Controller('/mollie')
export class MollieController {
  private readonly callbackUrl = 'https://bidding.eccube.de/callback';
  private config: ModuleOptions;
  private client: AuthorizationCode;

  constructor(
    private readonly mollieService: MollieService,
    private readonly configService: ConfigService,
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
        tokenHost: this.configService.get('mollie.apiHost')!,
        tokenPath: '/oauth2/tokens',
      },
    };
    this.client = new AuthorizationCode(this.config);
  }

  // *
  // * Mollie API - Connect ( OAuth2 )
  // *
  // * https://docs.mollie.com/connect/getting-started
  // */

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
        'onboarding.read',
        'onboarding.write',
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
    )) as unknown as IMollieTokensResponse;
    const accessToken = data?.token?.access_token;
    const refreshToken = data?.token?.refresh_token;
    const expiresAt = data?.token?.expires_at;
    if (!accessToken || !refreshToken) {
      return res.status(400).json({ message: 'Auth error' });
    }
    // TODO: update access-token on cookies
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
  // *
  // * https://docs.mollie.com/reference/v2/profiles-api/overview
  // */

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('/create/profile')
  async createProfile(@UserId() userId: string) {
    return this.mollieService.createMollieProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/update/profile')
  async updateProfile(
    @UserId() userId: string,
    @Body() updateProfileDto: UpdateMollieProfileDto,
  ) {
    return this.mollieService.updateMollieProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/get/profile')
  async getProfile(@UserId() userId: string) {
    return this.mollieService.getMollieProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Get('/delete/profile')
  async deleteProfiles(@UserId() userId: string) {
    return this.mollieService.deleteMollieProfile(userId);
  }

  // *
  // * Mollie API - submit onboarding data
  // *
  // * https://docs.mollie.com/reference/v2/onboarding-api/submit-onboarding-data
  // *
  // * TODO: should be update next time to https://docs.mollie.com/reference/v2/client-links-api/create-client-link
  // */

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/onboarding/me')
  async submitOnboardingData(@UserId() userId: string): Promise<void> {
    await this.mollieService.submitOnboardingData(userId);
  }

  // *
  // * Mollie API - get onboarding status
  // *
  // * https://docs.mollie.com/reference/v2/onboarding-api/get-onboarding-status
  // */

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/onboarding-status')
  async getOnboardingStatus(
    @UserId() userId: string,
  ): Promise<IMollieOnboardingStatusResponse> {
    return this.mollieService.getOnboardingStatus(userId);
  }

  // *
  // * Mollie API - enable Payment Methods
  // *
  // * https://docs.mollie.com/reference/v2/profiles-api/enable-method
  // */

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Post('/profiles/methods/:method')
  async enablePaymentMethod(
    @UserId() userId: string,
    @Param('method') method: string,
  ): Promise<IMollieProfileEnabledPaymentMethodResponse> {
    return this.mollieService.enablePaymentMethod(userId, method);
  }

  // *
  // * Mollie API - list of Payment Methods
  // *
  // * https://docs.mollie.com/reference/v2/methods-api/list-methods
  // */

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/methods')
  async getPaymentMethods(
    @UserId() userId: string,
    @Query('include') include: MollieMethodQuery,
  ): Promise<IMollieListPaymentMethodsResponse> {
    return this.mollieService.listPaymentMethods(userId, include);
  }
}
