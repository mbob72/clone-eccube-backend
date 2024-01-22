// https://docs.mollie.com/reference/v2/profiles-api/create-profile

import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMollieProfileDto {
  /* The profile’s name should reflect the trade name or brand name of the profile’s website or application. */
  @IsString()
  @IsNotEmpty()
  readonly name: string;

  /*
    The URL to the profile’s website or application.
    The URL must be compliant to RFC3986 with the exception that we only accept URLs with http:// or https:// schemes
    and domains that contain a TLD. URLs containing an @ are not allowed.
    */
  @IsString()
  @IsNotEmpty()
  readonly website: string;

  /* The email address associated with the profile’s trade name or brand. */
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  // The phone number associated with the profile’s trade name or brand. Must be in the E.164 format. For example +31208202070.
  @IsString()
  @IsNotEmpty()
  readonly phone: string;

  // The products or services that the profile’s website offers.
  @IsString()
  @IsOptional()
  readonly description?: string;

  // The industry associated with the profile’s website.
  @IsArray()
  // @ArrayMinSize(1)
  @Type(() => String)
  @IsOptional()
  readonly countriesOfActivity?: string[];

  /*
    The industry associated with the profile’s trade name or brand.
    Refer to the documentation of the business category (https://docs.mollie.com/overview/common-data-types#business-category)
    for more information on which values are accepted.
    */
  @IsString()
  @IsOptional()
  readonly businessCategory?: string;

  /*
    Creating a test profile by setting this parameter to test,
    enables you to start using the API without having to provide all your business info just yet.
    Defaults to live.
    */
  @IsString()
  @IsOptional()
  readonly mode?: 'live' | 'test';
}
