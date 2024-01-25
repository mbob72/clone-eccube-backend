import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { UserType } from '../users.type';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(48)
  password: string;

  @IsString()
  @IsNotEmpty()
  type: UserType;
}
