import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { CreateMollieProfileDto } from './dto/createMollieProfile.dto';
import { IMollieProfileResponse } from './types';
import { UpdateMollieProfileDto } from './dto/updateMollieProfile.dto';

@Injectable()
export class MollieService {
  constructor(
    private readonly httpClient: HttpService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  // *
  // * Mollie API - Connect ( OAuth2 )
  // */

  /**
   * @legacy
   * use `simple-oauth2` method `client.getToken(config)`
   * saved just for usage example
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

  // *
  // * Mollie API - profile CRUD
  // */

  async createMollieProfile(
    userId: string,
    payload: CreateMollieProfileDto,
  ): Promise<IMollieProfileResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found!');
    }
    const { mollieAccessToken } = user;
    if (!mollieAccessToken) {
      throw new Error('Mollie access token not found!');
    }
    try {
      const data = await firstValueFrom(
        this.httpClient
          .post(
            `${this.configService.get('mollie.tokenHost')!}/v2/profiles`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${mollieAccessToken}`,
              },
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              console.log('error:: ', error.message);
              throw 'An error happened!';
            }),
          ),
      );
      console.log('created mollie profile:: ', data);
      this.usersService.saveMollieProfileId(userId, data.id);
      return data;
    } catch (error) {
      console.log('error:: ', error.message);
      throw 'Create Mollie profile error';
    }
  }

  async updateMollieProfile(
    userId: string,
    payload: UpdateMollieProfileDto,
  ): Promise<IMollieProfileResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found!');
    }
    const { mollieAccessToken } = user;
    if (!mollieAccessToken) {
      throw new Error('Mollie access token not found!');
    }
    const { mollieProfileId } = user;
    if (!mollieProfileId) {
      throw new Error('Mollie profileId not found!');
    }
    try {
      const data = await firstValueFrom(
        this.httpClient
          .patch(
            `${this.configService.get(
              'mollie.tokenHost',
            )!}/v2/profiles/${mollieProfileId}`,
            payload,
            {
              headers: {
                Authorization: `Bearer ${mollieAccessToken}`,
              },
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              console.log('error:: ', error.message);
              throw 'An error happened!';
            }),
          ),
      );
      console.log('updated mollie profile:: ', data);
      return data;
    } catch (error) {
      console.log('error:: ', error.message);
      throw 'Update Mollie profile error';
    }
  }

  async getMollieProfile(userId: string): Promise<IMollieProfileResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found!');
    }
    const { mollieAccessToken } = user;
    if (!mollieAccessToken) {
      throw new Error('Mollie access token not found!');
    }
    const { mollieProfileId } = user;
    if (!mollieProfileId) {
      throw new Error('Mollie profileId not found!');
    }
    try {
      const data = await firstValueFrom(
        this.httpClient
          .get(
            `${this.configService.get(
              'mollie.tokenHost',
            )!}/v2/profiles/${mollieProfileId}`,
            {
              headers: {
                Authorization: `Bearer ${mollieAccessToken}`,
              },
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              console.log('error:: ', error.message);
              throw 'An error happened!';
            }),
          ),
      );
      console.log('get mollie profile:: ', data);
      return data;
    } catch (error) {
      console.log('error:: ', error.message);
      throw 'Get Mollie profile error';
    }
  }

  async deleteMollieProfile(userId: string): Promise<{ id: string }> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found!');
    }
    const { mollieAccessToken } = user;
    if (!mollieAccessToken) {
      throw new Error('Mollie access token not found!');
    }
    const { mollieProfileId } = user;
    if (!mollieProfileId) {
      throw new Error('Mollie profileId not found!');
    }
    try {
      await firstValueFrom(
        this.httpClient
          .delete(
            `${this.configService.get(
              'mollie.tokenHost',
            )!}/v2/profiles/${mollieProfileId}`,
            {
              headers: {
                Authorization: `Bearer ${mollieAccessToken}`,
              },
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              console.log('error:: ', error.message);
              throw 'An error happened!';
            }),
          ),
      );
      return { id: mollieProfileId };
    } catch (error) {
      console.log('error:: ', error.message);
      throw 'Delete Mollie profile error';
    }
  }
}
