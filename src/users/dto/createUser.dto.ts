import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
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
  readonly type: UserType;

  // @IsBoolean()
  // @IsOptional()
  // readonly isVerified?: boolean;

  // @IsBoolean()
  // @IsOptional()
  // readonly isActive?: boolean;
}
