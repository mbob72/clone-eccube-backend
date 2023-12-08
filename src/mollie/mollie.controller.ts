import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthorizationCode } from 'simple-oauth2';
import { MollieService } from './mollie.service';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('/mollie')
export class MollieController {
  constructor(
    private readonly mollieService: MollieService,
    private readonly configService: ConfigService,
    private readonly httpClient: HttpService,
  ) {}

  private readonly callbackUrl = 'https://bidding.eccube.de';

  private readonly config = {
    client: {
      id: this.configService.get('mollie.clientId')!,
      secret: this.configService.get('mollie.clientSecret')!,
    },
    auth: {
      tokenHost: this.configService.get('mollie.url')!,
      tokenPath: '/oauth2/tokens',
      authorizePath: '/oauth2/authorize',
    },
  };

  private readonly client = new AuthorizationCode(this.config);

  @Public()
  @Get('/auth')
  create(@Req() req: Request, @Res() res: Response) {
    const authorizationUri = this.client.authorizeURL({
      redirect_uri: this.callbackUrl,
      scope: ['payments.write', 'refunds.write'],
      state: '3(#0/!~',
    });
    res.redirect(authorizationUri);

    // from GitHub docs

    // const tokenParams = {
    //   code: '<code>',
    //   redirect_uri: 'http://localhost:3000/callback',
    //   scope: '<scope>',
    // };
    // try {
    //   const accessToken = await client.getToken(tokenParams);
    // } catch (error) {
    //   console.log('Access Token Error', error.message);
    // }
  }

  // Callback service parsing the authorization token and asking for the access token
  @Public()
  @Get('/')
  callback(@Req() req: Request, @Res() res: Response) {
    const { code } = req.query;
    this.httpClient
      .post(
        'https://api.mollie.com/oauth2/tokens',
        {
          code,
          redirect_uri: this.callbackUrl,
          grant_type: 'authorization_code',
        },
        {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          auth: {
            username: this.configService.get('mollie.clientId')!,
            password: this.configService.get('mollie.clientSecret')!,
          },
        },
      )
      .subscribe((response) => {
        console.log('have response::', response);
      });
    return res.status(200).json(code);
  }

  @Public()
  @Get('/login')
  login(@Req() req: Request, @Res() res: Response) {
    res.send('Hello<br><a href="/auth">Log in with Mollie</a>');
  }
}
