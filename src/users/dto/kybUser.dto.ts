import { Organization } from '@mollie/api-client';
import { IsNotEmpty, IsString } from 'class-validator';

export class KybUserDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  organization: Organization;
}
