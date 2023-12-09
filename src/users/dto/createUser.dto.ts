import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { UserType } from '../users.type';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(48)
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsString()
  @IsNotEmpty()
  readonly type: UserType;

  @IsBoolean()
  @IsOptional()
  readonly isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;
}

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  readonly email?: string;

  @IsString()
  @IsOptional()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  readonly lastName?: string;

  @IsBoolean()
  @IsOptional()
  readonly isVerified?: boolean;

  @IsBoolean()
  @IsOptional()
  readonly isActive?: boolean;

  @IsString()
  @IsOptional()
  readonly mollieAccessToken?: string;
}
