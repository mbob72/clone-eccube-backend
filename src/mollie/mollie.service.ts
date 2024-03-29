import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import { UsersService } from 'src/users/users.service';
import { CreateMollieProfileDto } from './dto/createMollieProfile.dto';
import {
  IMollieListPaymentMethodsResponse,
  IMollieOnboardingStatusResponse,
  IMollieProfileEnabledPaymentMethodResponse,
  IMollieProfileResponse,
  MollieMethodQuery,
} from './types';
import { UpdateMollieProfileDto } from './dto/updateMollieProfile.dto';
import { pick } from 'radash';

@Injectable()
export class MollieService {
  private apiHost: string = this.configService.get('mollie.apiHost')!;

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
   * saved just for explanation how it works
   */
  async getAccessToken(code: string, redirect_uri: string) {
    const user = this.configService.get('mollie.clientId')!;
    const pass = this.configService.get('mollie.clientSecret')!;
    const token = Buffer.from(`${user}:${pass}`, 'utf8').toString('base64');
    const { data } = await firstValueFrom(
      this.httpClient
        .post(
          'https://api.mollie.com/oauth2/tokens',
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

  async createMollieProfile(userId: string): Promise<IMollieProfileResponse> {
    const user = await this.usersService.findByIdWithOrganization(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { organization } = user;
    if (!organization) {
      throw new Error('Organization not found');
    }
    const { mollieAccessToken } = user;
    if (!mollieAccessToken) {
      throw new Error('Mollie access token not found!');
    }
    const createProfileDto: CreateMollieProfileDto = pick({ ...organization }, [
      'name',
      'email',
      'phone',
      'website',
      'businessCategory',
      'mode',
    ]);
    try {
      const data = await firstValueFrom(
        this.httpClient
          .post(`${this.apiHost}/v2/profiles`, createProfileDto, {
            headers: {
              Authorization: `Bearer ${mollieAccessToken}`,
            },
          })
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
          .patch(`${this.apiHost}/v2/profiles/${mollieProfileId}`, payload, {
            headers: {
              Authorization: `Bearer ${mollieAccessToken}`,
            },
          })
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
          .get(`${this.apiHost}/v2/profiles/${mollieProfileId}`, {
            headers: {
              Authorization: `Bearer ${mollieAccessToken}`,
            },
          })
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
          .delete(`${this.apiHost}/v2/profiles/${mollieProfileId}`, {
            headers: {
              Authorization: `Bearer ${mollieAccessToken}`,
            },
          })
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

  // *
  // * Mollie API - submit onboarding data
  // */
  // TODO: types
  async submitOnboardingData(userId: string): Promise<boolean> {
    const user = await this.usersService.findByIdWithOrganization(userId);
    if (!user) {
      throw new Error('User not found');
    }
    const { organization } = user;
    if (!organization) {
      throw new Error('Organization not found');
    }
    const { mollieAccessToken } = user;
    if (!mollieAccessToken) {
      throw new Error('Mollie access token not found!');
    }
    const onboardingDto: any = {
      organization: {
        name: organization.name,
        vatNumber: organization.vatNumber,
        registrationNumber: organization.registrationNumber,
        address: {
          streetAndNumber: organization.streetAndNumber,
          postalCode: organization.postalCode,
          city: organization.city,
          country: organization.country,
        },
        // categoryCode: organization.categoryCode,
        // chamberOfCommerce: organization.chamberOfCommerce,
      },
      profile: {
        name: organization.name,
        email: organization.email,
        phone: organization.phone,
        url: organization.website,
        businessCategory: organization.businessCategory,
      },
    };
    try {
      await firstValueFrom(
        this.httpClient
          .post(`${this.apiHost}/v2/onboarding/me`, onboardingDto, {
            headers: {
              Authorization: `Bearer ${mollieAccessToken}`,
            },
          })
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              console.log('error:: ', error.message);
              throw 'An error happened!';
            }),
          ),
      );
      console.log('Successfully submitted onboarding data:: ', onboardingDto);
      return true;
    } catch (error) {
      console.log('error:: ', error.message);
      throw 'Submit Mollie onboarding data error';
    }
  }

  // *
  // * Mollie API - enable Payment Methods
  // */

  // TODO: create interface for `method` param
  async enablePaymentMethod(
    userId: string,
    method: string,
  ): Promise<IMollieProfileEnabledPaymentMethodResponse> {
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
      const res = await firstValueFrom(
        this.httpClient
          .post(
            `${this.apiHost}/v2/profiles/${mollieProfileId}/methods/${method}`,
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
      return res;
    } catch (error) {
      console.log('error:: ', error.message);
      throw 'Enable Mollie profile payment method error';
    }
  }

  // *
  // * Mollie API - list of Payment Methods
  // */

  async listPaymentMethods(
    userId: string,
    include: MollieMethodQuery,
  ): Promise<IMollieListPaymentMethodsResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found!');
    }
    const { mollieAccessToken } = user;
    if (!mollieAccessToken) {
      throw new Error('Mollie access token not found!');
    }
    try {
      const res = await firstValueFrom(
        this.httpClient
          .get(`${this.apiHost}/v2/methods?include=${include}`, {
            headers: {
              Authorization: `Bearer ${mollieAccessToken}`,
            },
          })
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              console.log('error:: ', error.message);
              throw 'An error happened!';
            }),
          ),
      );
      return res;
    } catch (error) {
      console.log('error:: ', error.message);
      throw 'Mollie list payment methods error';
    }
  }

  // *
  // * Mollie API - Onboarding Status
  // */

  async getOnboardingStatus(
    userId: string,
  ): Promise<IMollieOnboardingStatusResponse> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found!');
    }
    const { mollieAccessToken } = user;
    if (!mollieAccessToken) {
      throw new Error('Mollie access token not found!');
    }
    try {
      const res = await firstValueFrom(
        this.httpClient
          .get(`${this.apiHost}/v2/onboarding/me`, {
            headers: {
              Authorization: `Bearer ${mollieAccessToken}`,
            },
          })
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              console.log('error:: ', error.message);
              throw 'An error happened!';
            }),
          ),
      );
      return res;
    } catch (error) {
      console.log('error:: ', error.message);
      throw 'Mollie onboarding status error';
    }
  }
}
