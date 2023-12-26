import { ConfigService } from '@nestjs/config';
import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthorizationCode, ModuleOptions } from 'simple-oauth2';
import { MollieService } from './mollie.service';
import { Public } from 'src/auth/decorators/public.decorator';
import { UserId } from 'src/auth/decorators/userId.decorator';
import { generateAuthorizeUrlState } from './lib';
import { Nullable } from 'src/types/utils';
import { JwtAuthGuard } from 'src/auth/guards/jwtAuth.guard';

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
@Controller('/')
export class MollieController {
  private readonly callbackUrl = 'https://bidding.eccube.de/callback';
  private config: ModuleOptions;
  private client: AuthorizationCode;

  constructor(
    private readonly mollieService: MollieService,
    private readonly configService: ConfigService,
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

  // @Public()
  @UseGuards(JwtAuthGuard)
  @Get('/auth')
  create(@Req() req: Request, @Res() res: Response) {
    const authorizationUri = this.client.authorizeURL({
      redirect_uri: this.callbackUrl,
      scope: ['payments.write', 'refunds.write'],
      state: generateAuthorizeUrlState(), // '3(#0/!~',
    });
    res.redirect(authorizationUri);
    // return res.status(200).json({ authorizationUri });
  }

  // Callback service parsing the authorization token and asking for the access token
  // @Public()
  @UseGuards(JwtAuthGuard)
  @Get('/callback')
  async callback(@Req() req: Request, @Res() res: Response) {
    const { code } = req.query;
    let access_token: Nullable<string> = null;
    const tokenParams = {
      code: code as string,
      redirect_uri: this.callbackUrl,
      grant_type: 'authorization_code',
    };
    try {
      const data = (await this.client.getToken(
        tokenParams,
      )) as unknown as ITokenRes;
      access_token = data.token.access_token;
      console.log('accessToken::', access_token);
      // await this.mollieService.saveAccessToken(token, userId);
    } catch (error) {
      console.log('Access Token Error::', error.message);
    }
    return res.status(200).json({ access_token });
  }

  @Public()
  @Get('/login')
  login(@Req() req: Request, @Res() res: Response) {
    res.send('Hello<br><a href="/auth">Log in with Mollie</a>');
  }

  @UseGuards(JwtAuthGuard)
  @Post('/mollie/token')
  async saveToken(
    @UserId() userId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { token } = req.body;
    await this.mollieService.saveAccessToken(token, userId);
    return res.status(200).json({ message: 'Token saved' });
  }
}
