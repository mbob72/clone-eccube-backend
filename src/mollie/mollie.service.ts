import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class MollieService {
  constructor(
    private readonly httpClient: HttpService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async saveAccessToken(token: string, userId: string) {
    if (!token) {
      throw new Error('Token not passed!');
    }
    if (!userId) {
      throw new Error('User id not passed!');
    }
    await this.usersService.update(userId, {
      mollieAccessToken: token,
    });
  }

  /**
   * @deprecated
   * use `simple-oauth2` method `client.getToken(config)`
   */
  async getAccessToken(code: string, redirect_uri: string) {
    const user = this.configService.get('mollie.clientId')!;
    const pass = this.configService.get('mollie.clientSecret')!;
    const token = Buffer.from(`${user}:${pass}`, 'utf8').toString('base64');
    const { data } = await firstValueFrom(
      this.httpClient
        .post(
          'https://api.mollie.com/oauth2/tokens',
          // body: token params
          {
            code,
            redirect_uri,
            grant_type: 'authorization_code',
          },
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${token}`,
            },
          },
        )
        .pipe(
          // map((response) => response.data),
          catchError((error: AxiosError) => {
            console.log('error::', error.message);
            throw 'An error happened!';
          }),
        ),
    );
    console.log('access_token::', data.access_token);
    return data;
  }
}
